import type { Product } from '@prisma/client';

export type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  detailsHtml: string | null;
  category: string;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  image: string;
  hoverImage: string;
  galleryImages: string[];
  badge: string | null;
  stock: number;
  deliveryType: string;
  deliveryCharge: number | null;
};

export function hasProductDiscount(product: Pick<Product, 'originalPrice' | 'priceAfterDiscount'>) {
  return (
    product.priceAfterDiscount != null &&
    product.priceAfterDiscount > 0 &&
    product.priceAfterDiscount < product.originalPrice
  );
}

export function getSellingPrice(product: Pick<Product, 'originalPrice' | 'priceAfterDiscount'>) {
  return hasProductDiscount(product)
    ? product.priceAfterDiscount!
    : product.originalPrice;
}

export function getDiscountPercent(
  product: Pick<Product, 'originalPrice' | 'priceAfterDiscount'>,
) {
  if (!hasProductDiscount(product)) {
    return null;
  }

  return Math.round(
    ((product.originalPrice - product.priceAfterDiscount!) / product.originalPrice) * 100,
  );
}

export function mapProductToPublic(product: Product): PublicProduct {
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
    deliveryCharge:
      product.deliveryType === 'CHARGED' ? product.deliveryCharge : null,
  };
}

export function slugifyName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeBadge(badge: string | null | undefined) {
  const trimmed = badge?.trim();
  return trimmed ? trimmed : null;
}

export function normalizeDetailsHtml(html: string | null | undefined) {
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
