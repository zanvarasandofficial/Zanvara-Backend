import { Review } from '@prisma/client';
export declare function mapReview(review: Review): {
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
};
