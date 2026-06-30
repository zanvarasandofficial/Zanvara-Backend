"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const review_mapper_1 = require("./review.mapper");
const ORDER_STATUS_LABELS = {
    pending: 'Order Received',
    confirmed: 'Processing at Warehouse',
    shipped: 'Dispatched from Warehouse',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findPublished(limit) {
        const reviews = await this.prisma.review.findMany({
            where: {
                status: 'Published',
                verified: true,
            },
            orderBy: { createdAt: 'desc' },
            ...(typeof limit === 'number' ? { take: limit } : {}),
        });
        return reviews.map(review_mapper_1.mapReview);
    }
    async findPublishedByProduct(productId) {
        const reviews = await this.prisma.review.findMany({
            where: {
                productId,
                status: 'Published',
                verified: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return reviews.map(review_mapper_1.mapReview);
    }
    async getSummary() {
        const reviews = await this.prisma.review.findMany({
            where: {
                status: 'Published',
                verified: true,
                rating: { gt: 0 },
            },
            select: { rating: true },
        });
        if (reviews.length === 0) {
            return { average: 0, total: 0, published: 0 };
        }
        const average = reviews.reduce((total, review) => total + review.rating, 0) /
            reviews.length;
        const stats = await this.getAdminStats();
        return {
            average,
            total: stats.total,
            published: stats.published,
        };
    }
    async findAllAdmin() {
        const reviews = await this.prisma.review.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return reviews.map(review_mapper_1.mapReview);
    }
    async getAdminStats() {
        const reviews = await this.prisma.review.findMany({
            select: { status: true, rating: true },
        });
        const pending = reviews.filter((review) => review.status === 'Pending').length;
        const published = reviews.filter((review) => review.status === 'Published').length;
        const rejected = reviews.filter((review) => review.status === 'Rejected').length;
        const rated = reviews.filter((review) => review.rating > 0);
        const average = rated.length > 0
            ? rated.reduce((total, review) => total + review.rating, 0) /
                rated.length
            : 0;
        return {
            average,
            total: reviews.length,
            pending,
            published,
            rejected,
        };
    }
    async findReviewedProductIds(userId) {
        const reviews = await this.prisma.review.findMany({
            where: {
                userId,
                source: 'customer',
            },
            select: { productId: true },
        });
        return [
            ...new Set(reviews
                .map((review) => this.normalizeProductId(review.productId))
                .filter(Boolean)),
        ];
    }
    async getOrderItemReviewStatus(user, items) {
        const normalizedItems = items
            .map((item) => ({
            orderNumber: String(item.orderNumber ?? '').trim(),
            productId: this.normalizeProductId(item.productId),
        }))
            .filter((item) => item.orderNumber && item.productId);
        if (normalizedItems.length === 0) {
            return {};
        }
        const orderNumbers = [
            ...new Set(normalizedItems.map((item) => item.orderNumber)),
        ];
        const orders = await this.prisma.order.findMany({
            where: {
                userId: user.id,
                orderNumber: { in: orderNumbers },
            },
        });
        const orderByNumber = new Map(orders.map((order) => [order.orderNumber, order]));
        const productIds = [
            ...new Set(normalizedItems.map((item) => item.productId)),
        ];
        const reviews = await this.prisma.review.findMany({
            where: {
                userId: user.id,
                source: 'customer',
                OR: [
                    { orderId: { in: orders.map((order) => order.id) } },
                    { orderId: null, productId: { in: productIds } },
                ],
            },
            select: { orderId: true, productId: true },
        });
        const reviewedKeys = new Set(reviews
            .filter((review) => review.orderId)
            .map((review) => `${review.orderId}:${this.normalizeProductId(review.productId)}`));
        const legacyReviewedProducts = new Set(reviews
            .filter((review) => !review.orderId)
            .map((review) => this.normalizeProductId(review.productId)));
        return normalizedItems.reduce((acc, item) => {
            const key = this.orderItemKey(item.orderNumber, item.productId);
            const order = orderByNumber.get(item.orderNumber);
            if (!order) {
                acc[key] = { reviewed: false };
                return acc;
            }
            acc[key] = {
                reviewed: reviewedKeys.has(`${order.id}:${item.productId}`) ||
                    legacyReviewedProducts.has(item.productId),
            };
            return acc;
        }, {});
    }
    async getEligibility(user, productId, orderNumber) {
        const normalizedProductId = this.normalizeProductId(productId);
        const orders = await this.prisma.order.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
        if (orderNumber?.trim()) {
            const order = orders.find((entry) => entry.orderNumber === orderNumber.trim());
            if (!order) {
                return this.buildEligibility({
                    canReview: false,
                    state: 'no_purchase',
                    message: 'Is order ke liye review available nahi hai.',
                });
            }
            return this.evaluateOrderItemEligibility(order, normalizedProductId, user.id);
        }
        for (const order of orders) {
            if (this.normalizeStatus(order.status) !== 'delivered') {
                continue;
            }
            if (!this.orderHasProduct(order, normalizedProductId)) {
                continue;
            }
            const existing = await this.hasReviewForOrderItem(user.id, order.id, normalizedProductId);
            if (!existing) {
                return this.buildEligibility({
                    canReview: true,
                    state: 'eligible',
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    message: 'Aap ka parcel deliver ho chuka hai. Ab review submit kar sakte hain.',
                });
            }
        }
        for (const order of orders) {
            if (!this.orderHasProduct(order, normalizedProductId)) {
                continue;
            }
            const status = this.normalizeStatus(order.status);
            if (status !== 'delivered' && status !== 'cancelled') {
                return this.buildEligibility({
                    canReview: false,
                    state: 'pending',
                    orderStatus: status,
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    message: `Review tab available hogi jab order "${ORDER_STATUS_LABELS[status] ?? status}" ho jaye.`,
                });
            }
        }
        const hadDeliveredOrder = orders.some((order) => this.normalizeStatus(order.status) === 'delivered' &&
            this.orderHasProduct(order, normalizedProductId));
        if (hadDeliveredOrder) {
            return this.buildEligibility({
                canReview: false,
                state: 'already_reviewed',
                message: 'Aap is product ke delivered orders ka review de chuke hain.',
            });
        }
        return this.buildEligibility({
            canReview: false,
            state: 'no_purchase',
            message: 'Review sirf un customers de sakte hain jinka is product ka order deliver ho chuka ho.',
        });
    }
    async createForCustomer(user, dto) {
        const normalizedProductId = this.normalizeProductId(dto.productId);
        const orderNumber = dto.orderNumber?.trim();
        const eligibility = await this.getEligibility(user, normalizedProductId, orderNumber || undefined);
        if (!eligibility.canReview) {
            throw new common_1.BadRequestException(eligibility.message || 'Review submit nahi ho sakti.');
        }
        const product = await this.prisma.product.findUnique({
            where: { id: normalizedProductId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found.');
        }
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
        });
        const customerName = dbUser?.name?.trim();
        if (!customerName) {
            throw new common_1.BadRequestException('Pehle apna profile name set karein.');
        }
        const review = await this.prisma.review.create({
            data: {
                productId: normalizedProductId,
                productName: product.name,
                userId: user.id,
                userEmail: user.email.toLowerCase(),
                orderId: eligibility.orderId ?? dto.orderId ?? null,
                source: 'customer',
                customerName,
                customerCity: dto.customerCity.trim(),
                rating: dto.rating,
                title: dto.title.trim(),
                comment: dto.comment.trim(),
                status: 'Published',
                verified: true,
            },
        });
        return (0, review_mapper_1.mapReview)(review);
    }
    async createForAdmin(dto) {
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found.');
        }
        const review = await this.prisma.review.create({
            data: {
                productId: dto.productId,
                productName: product.name,
                source: 'admin',
                customerName: dto.customerName.trim(),
                customerCity: dto.customerCity.trim(),
                rating: dto.rating,
                title: dto.title.trim(),
                comment: dto.comment.trim(),
                status: dto.status?.trim() || 'Published',
                verified: dto.verified ?? true,
            },
        });
        return (0, review_mapper_1.mapReview)(review);
    }
    async updateAdmin(id, dto) {
        const existing = await this.findReviewRecord(id);
        let productName = existing.productName;
        if (dto.productId && dto.productId !== existing.productId) {
            const product = await this.prisma.product.findUnique({
                where: { id: dto.productId },
            });
            if (!product) {
                throw new common_1.NotFoundException('Product not found.');
            }
            productName = product.name;
        }
        const updated = await this.prisma.review.update({
            where: { id: existing.id },
            data: {
                ...(dto.productId ? { productId: dto.productId, productName } : {}),
                ...(dto.customerName !== undefined
                    ? { customerName: dto.customerName.trim() }
                    : {}),
                ...(dto.customerCity !== undefined
                    ? { customerCity: dto.customerCity.trim() }
                    : {}),
                ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
                ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
                ...(dto.comment !== undefined ? { comment: dto.comment.trim() } : {}),
                ...(dto.status !== undefined ? { status: dto.status } : {}),
                ...(dto.verified !== undefined ? { verified: dto.verified } : {}),
            },
        });
        return (0, review_mapper_1.mapReview)(updated);
    }
    async deleteAdmin(id) {
        const existing = await this.findReviewRecord(id);
        await this.prisma.review.delete({ where: { id: existing.id } });
        return { success: true };
    }
    buildEligibility(payload) {
        return payload;
    }
    orderItemKey(orderNumber, productId) {
        return `${String(orderNumber).trim()}:${this.normalizeProductId(productId)}`;
    }
    findOrderItemReview(userId, orderId, productId) {
        return this.prisma.review.findFirst({
            where: {
                userId,
                source: 'customer',
                orderId,
                productId,
            },
        });
    }
    async hasReviewForOrderItem(userId, orderId, productId) {
        const linked = await this.findOrderItemReview(userId, orderId, productId);
        if (linked) {
            return true;
        }
        const legacy = await this.prisma.review.findFirst({
            where: {
                userId,
                source: 'customer',
                productId,
                orderId: null,
            },
        });
        return Boolean(legacy);
    }
    async evaluateOrderItemEligibility(order, productId, userId) {
        if (!this.orderHasProduct(order, productId)) {
            return this.buildEligibility({
                canReview: false,
                state: 'no_purchase',
                message: 'Is order mein yeh product nahi hai.',
            });
        }
        const status = this.normalizeStatus(order.status);
        if (status === 'cancelled') {
            return this.buildEligibility({
                canReview: false,
                state: 'no_purchase',
                message: 'Cancelled order par review submit nahi ho sakti.',
            });
        }
        if (status !== 'delivered') {
            return this.buildEligibility({
                canReview: false,
                state: 'pending',
                orderStatus: status,
                orderId: order.id,
                orderNumber: order.orderNumber,
                message: `Review tab available hogi jab order "${ORDER_STATUS_LABELS[status] ?? status}" ho jaye.`,
            });
        }
        const existing = await this.hasReviewForOrderItem(userId, order.id, productId);
        if (existing) {
            return this.buildEligibility({
                canReview: false,
                state: 'already_reviewed',
                message: 'Is order ka review pehle hi submit ho chuka hai.',
            });
        }
        return this.buildEligibility({
            canReview: true,
            state: 'eligible',
            orderId: order.id,
            orderNumber: order.orderNumber,
            message: 'Aap ka parcel deliver ho chuka hai. Ab review submit kar sakte hain.',
        });
    }
    normalizeStatus(status) {
        return String(status ?? 'pending').trim().toLowerCase();
    }
    normalizeProductId(id) {
        return String(id ?? '').trim();
    }
    orderHasProduct(order, productId) {
        const target = this.normalizeProductId(productId);
        return this.parseOrderItems(order).some((item) => this.normalizeProductId(item.productId) === target);
    }
    parseOrderItems(order) {
        if (!Array.isArray(order.items)) {
            return [];
        }
        return order.items;
    }
    async findReviewRecord(id) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review) {
            throw new common_1.NotFoundException('Review not found.');
        }
        return review;
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map