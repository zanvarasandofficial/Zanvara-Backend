import { Product } from '@prisma/client';
export type ProductFulfillmentMode = 'standard' | 'pre_order' | 'coming_soon';
export declare function isComingSoonBlocked(product: Pick<Product, 'isComingSoon' | 'availableAt'>): boolean;
export declare function isPreOrderProduct(product: Pick<Product, 'isPreOrder'>): boolean;
export declare function getProductFulfillmentMode(product: Pick<Product, 'isComingSoon' | 'availableAt' | 'isPreOrder'>): ProductFulfillmentMode;
export declare function getPreOrderSlotsRemaining(product: Pick<Product, 'preOrderCapacity' | 'preOrderReserved'>): number;
export declare function getPurchasableQuantity(product: Product): number;
export declare function assertFulfillmentPurchaseAllowed(product: Product, quantity: number): void;
