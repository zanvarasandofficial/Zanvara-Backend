export declare class CreateProductDto {
    name: string;
    description?: string;
    detailsHtml?: string | null;
    category: string;
    originalPrice: number;
    priceAfterDiscount?: number | null;
    badge?: string;
    imageUrl: string;
    hoverImageUrl?: string;
    imagePublicId?: string;
    hoverImagePublicId?: string;
    galleryImageUrls?: string[];
    galleryImagePublicIds?: string[];
    stock: number;
    status: 'PUBLISHED' | 'DRAFT';
    isPopular: boolean;
    deliveryType: 'FREE' | 'CHARGED';
    deliveryCharge?: number | null;
}
