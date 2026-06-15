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
exports.InboundService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const CONTACT = 'CONTACT';
const NEWSLETTER = 'NEWSLETTER';
let InboundService = class InboundService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapSubmission(submission) {
        return {
            id: submission.id,
            type: submission.type,
            firstName: submission.firstName,
            lastName: submission.lastName,
            email: submission.email,
            phone: submission.phone,
            message: submission.message,
            status: submission.status,
            createdAt: submission.createdAt,
            updatedAt: submission.updatedAt,
        };
    }
    async createContact(dto) {
        const submission = await this.prisma.inboundSubmission.create({
            data: {
                type: CONTACT,
                firstName: dto.firstName.trim(),
                lastName: dto.lastName.trim(),
                email: dto.email.trim().toLowerCase(),
                phone: dto.phone?.trim() || null,
                message: dto.message.trim(),
            },
        });
        return {
            message: 'Message sent successfully.',
            submission: this.mapSubmission(submission),
        };
    }
    async subscribeNewsletter(dto) {
        const email = dto.email.trim().toLowerCase();
        const existing = await this.prisma.inboundSubmission.findFirst({
            where: {
                type: NEWSLETTER,
                email,
            },
        });
        if (existing) {
            return {
                message: 'You are already subscribed.',
                alreadySubscribed: true,
                submission: this.mapSubmission(existing),
            };
        }
        const submission = await this.prisma.inboundSubmission.create({
            data: {
                type: NEWSLETTER,
                email,
            },
        });
        return {
            message: 'Subscribed successfully.',
            alreadySubscribed: false,
            submission: this.mapSubmission(submission),
        };
    }
    async findAllAdmin(type) {
        const submissions = await this.prisma.inboundSubmission.findMany({
            where: type ? { type } : undefined,
            orderBy: { createdAt: 'desc' },
        });
        return submissions.map((submission) => this.mapSubmission(submission));
    }
    async updateStatus(id, status) {
        const submission = await this.prisma.inboundSubmission.update({
            where: { id },
            data: { status },
        });
        return this.mapSubmission(submission);
    }
};
exports.InboundService = InboundService;
exports.InboundService = InboundService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InboundService);
//# sourceMappingURL=inbound.service.js.map