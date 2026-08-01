import { Product } from '@prisma/client';

export type ProductFulfillmentMode = 'standard' | 'pre_order' | 'coming_soon';

export function isComingSoonBlocked(product: Pick<Product, 'isComingSoon' | 'availableAt'>) {
  if (!product.isComingSoon) {
    return false;
  }

  if (!product.availableAt) {
    return true;
  }

  return product.availableAt.getTime() > Date.now();
}

export function isPreOrderProduct(product: Pick<Product, 'isPreOrder'>) {
  return Boolean(product.isPreOrder);
}

export function getProductFulfillmentMode(
  product: Pick<Product, 'isComingSoon' | 'availableAt' | 'isPreOrder'>,
): ProductFulfillmentMode {
  if (isComingSoonBlocked(product)) {
    return 'coming_soon';
  }

  if (isPreOrderProduct(product)) {
    return 'pre_order';
  }

  return 'standard';
}

export function getPreOrderSlotsRemaining(
  product: Pick<Product, 'preOrderCapacity' | 'preOrderReserved'>,
) {
  const capacity = product.preOrderCapacity ?? 0;
  const reserved = product.preOrderReserved ?? 0;
  return Math.max(0, capacity - reserved);
}

export function getPurchasableQuantity(product: Product) {
  const mode = getProductFulfillmentMode(product);

  if (mode === 'coming_soon') {
    return 0;
  }

  if (mode === 'pre_order') {
    return getPreOrderSlotsRemaining(product);
  }

  return Math.max(0, product.stock);
}

export function assertFulfillmentPurchaseAllowed(product: Product, quantity: number) {
  const mode = getProductFulfillmentMode(product);

  if (mode === 'coming_soon') {
    throw new Error('COMING_SOON');
  }

  if (mode === 'pre_order') {
    const remaining = getPreOrderSlotsRemaining(product);
    if (remaining <= 0) {
      throw new Error('PRE_ORDER_FULL');
    }
    if (quantity > remaining) {
      throw new Error('PRE_ORDER_LIMIT');
    }
    return;
  }

  if (quantity > product.stock) {
    throw new Error('STOCK');
  }
}
