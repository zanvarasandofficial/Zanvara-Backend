"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapReview = mapReview;
function mapReview(review) {
    return {
        id: review.id,
        productId: review.productId,
        productName: review.productName,
        userId: review.userId,
        userEmail: review.userEmail,
        orderId: review.orderId,
        source: review.source,
        customerName: review.customerName,
        customerCity: review.customerCity,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        status: review.status,
        verified: review.verified,
        date: review.createdAt.toISOString().slice(0, 10),
        createdAt: review.createdAt.toISOString(),
    };
}
//# sourceMappingURL=review.mapper.js.map