import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateReviewDto } from './dto/create-review.dto';
import { CheckOrderItemReviewStatusDto } from './dto/check-order-item-review-status.dto';
import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findPublished(limit?: string): Promise<{
        id: string;
        productId: string;
        productName: string;
        userId: string | null;
        userEmail: string | null;
        orderId: string | null;
        source: string;
        customerName: string;
        customerCity: string;
        rating: number;
        title: string;
        comment: string;
        status: string;
        verified: boolean;
        date: string;
        createdAt: string;
    }[]>;
    getSummary(): Promise<{
        average: number;
        total: number;
        published: number;
    }>;
    findByProduct(productId: string): Promise<{
        id: string;
        productId: string;
        productName: string;
        userId: string | null;
        userEmail: string | null;
        orderId: string | null;
        source: string;
        customerName: string;
        customerCity: string;
        rating: number;
        title: string;
        comment: string;
        status: string;
        verified: boolean;
        date: string;
        createdAt: string;
    }[]>;
    getEligibility(user: AuthenticatedUser, productId: string, orderNumber?: string): Promise<{
        canReview: boolean;
        state: "eligible" | "already_reviewed" | "pending" | "no_purchase";
        message: string;
        orderId?: string;
        orderNumber?: string;
        orderStatus?: string;
    }>;
    findReviewedProductIds(user: AuthenticatedUser): Promise<string[]>;
    getOrderItemReviewStatus(user: AuthenticatedUser, dto: CheckOrderItemReviewStatusDto): Promise<Record<string, {
        reviewed: boolean;
    }>>;
    create(user: AuthenticatedUser, dto: CreateReviewDto): Promise<{
        id: string;
        productId: string;
        productName: string;
        userId: string | null;
        userEmail: string | null;
        orderId: string | null;
        source: string;
        customerName: string;
        customerCity: string;
        rating: number;
        title: string;
        comment: string;
        status: string;
        verified: boolean;
        date: string;
        createdAt: string;
    }>;
}
