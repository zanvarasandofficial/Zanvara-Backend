export declare class UpdateProductDto {
    name?: string;
    description?: string;
    detailsHtml?: string | null;
    category?: string;
    originalPrice?: number;
    priceAfterDiscount?: number | null;
    badge?: string | null;
    imageUrl?: string;
    hoverImageUrl?: string | null;
    imagePublicId?: string | null;
    hoverImagePublicId?: string | null;
    galleryImageUrls?: string[];
    galleryImagePublicIds?: string[];
    stock?: number;
    status?: 'PUBLISHED' | 'DRAFT';
    isPopular?: boolean;
    deliveryType?: 'FREE' | 'CHARGED';
    deliveryCharge?: number | null;
}
