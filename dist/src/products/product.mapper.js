"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasProductDiscount = hasProductDiscount;
exports.getSellingPrice = getSellingPrice;
exports.getDiscountPercent = getDiscountPercent;
exports.mapProductToPublic = mapProductToPublic;
exports.slugifyName = slugifyName;
exports.normalizeBadge = normalizeBadge;
exports.normalizeDetailsHtml = normalizeDetailsHtml;
function hasProductDiscount(product) {
    return (product.priceAfterDiscount != null &&
        product.priceAfterDiscount > 0 &&
        product.priceAfterDiscount < product.originalPrice);
}
function getSellingPrice(product) {
    return hasProductDiscount(product)
        ? product.priceAfterDiscount
        : product.originalPrice;
}
function getDiscountPercent(product) {
    if (!hasProductDiscount(product)) {
        return null;
    }
    return Math.round(((product.originalPrice - product.priceAfterDiscount) / product.originalPrice) * 100);
}
function mapProductToPublic(product) {
    const discountPercent = getDiscountPercent(product);
    const hasDiscount = discountPercent != null;
    return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        detailsHtml: normalizeDetailsHtml(product.detailsHtml),
        category: product.category,
        price: getSellingPrice(product),
        originalPrice: hasDiscount ? product.originalPrice : null,
        discountPercent,
        image: product.imageUrl,
        hoverImage: product.hoverImageUrl || product.imageUrl,
        galleryImages: product.galleryImageUrls ?? [],
        badge: normalizeBadge(product.badge),
        stock: product.stock,
        deliveryType: product.deliveryType ?? 'FREE',
        deliveryCharge: product.deliveryType === 'CHARGED' ? product.deliveryCharge : null,
    };
}
function slugifyName(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function normalizeBadge(badge) {
    const trimmed = badge?.trim();
    return trimmed ? trimmed : null;
}
function normalizeDetailsHtml(html) {
    if (!html?.trim()) {
        return null;
    }
    const text = html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return text ? html.trim() : null;
}
//# sourceMappingURL=product.mapper.js.map