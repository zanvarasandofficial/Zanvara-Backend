import type { Product } from '@prisma/client';
import {
  resolveDeliveryOptionsFromProduct,
  type ProductDeliveryOption,
} from './delivery-options.util';
import { getPreOrderSlotsRemaining } from './product-fulfillment.util';

export type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  detailsHtml: string | null;
  specsHtml: string | null;
  whatsIncludedHtml: string | null;
  shippingReturnsHtml: string | null;
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
  deliveryOptions: ProductDeliveryOption[];
  isComingSoon: boolean;
  availableAt: string | null;
  isPreOrder: boolean;
  preOrderCapacity: number | null;
  preOrderSlotsRemaining: number | null;
  expectedShipAt: string | null;
  expectedShipNote: string | null;
  /** Set when admin entered USD prices; null → storefront uses FX from PKR */
  priceUsd: number | null;
  originalPriceUsd: number | null;
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

function resolvePublicUsdPricing(
  product: Pick<Product, 'originalPriceUsd' | 'priceAfterDiscountUsd'>,
) {
  const originalUsd = product.originalPriceUsd;
  const afterUsd = product.priceAfterDiscountUsd;

  if (originalUsd == null && afterUsd == null) {
    return { priceUsd: null, originalPriceUsd: null };
  }

  if (
    originalUsd != null &&
    afterUsd != null &&
    afterUsd > 0 &&
    afterUsd < originalUsd
  ) {
    return { priceUsd: afterUsd, originalPriceUsd: originalUsd };
  }

  if (originalUsd != null && originalUsd > 0) {
    return { priceUsd: originalUsd, originalPriceUsd: null };
  }

  if (afterUsd != null && afterUsd > 0) {
    return { priceUsd: afterUsd, originalPriceUsd: null };
  }

  return { priceUsd: null, originalPriceUsd: null };
}

export function mapProductToPublic(product: Product): PublicProduct {
  const discountPercent = getDiscountPercent(product);
  const hasDiscount = discountPercent != null;
  const usdPricing = resolvePublicUsdPricing(product);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    detailsHtml: normalizeDetailsHtml(product.detailsHtml),
    specsHtml: normalizeDetailsHtml(product.specsHtml),
    whatsIncludedHtml: normalizeDetailsHtml(product.whatsIncludedHtml),
    shippingReturnsHtml: normalizeDetailsHtml(product.shippingReturnsHtml),
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
    deliveryOptions: resolveDeliveryOptionsFromProduct(product),
    isComingSoon: Boolean(product.isComingSoon),
    availableAt: product.availableAt?.toISOString() ?? null,
    isPreOrder: Boolean(product.isPreOrder),
    preOrderCapacity: product.isPreOrder ? product.preOrderCapacity ?? null : null,
    preOrderSlotsRemaining: product.isPreOrder
      ? getPreOrderSlotsRemaining(product)
      : null,
    expectedShipAt: product.expectedShipAt?.toISOString() ?? null,
    expectedShipNote: product.expectedShipNote?.trim() || null,
    priceUsd: usdPricing.priceUsd,
    originalPriceUsd: usdPricing.originalPriceUsd,
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
