import { CreateAdminReviewDto } from './dto/create-admin-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';
export declare class AdminReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findAll(): Promise<{
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
    getStats(): Promise<{
        average: number;
        total: number;
        pending: number;
        published: number;
        rejected: number;
    }>;
    create(dto: CreateAdminReviewDto): Promise<{
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
    update(id: string, dto: UpdateReviewDto): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
