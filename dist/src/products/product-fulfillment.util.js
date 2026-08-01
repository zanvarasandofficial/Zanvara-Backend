"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isComingSoonBlocked = isComingSoonBlocked;
exports.isPreOrderProduct = isPreOrderProduct;
exports.getProductFulfillmentMode = getProductFulfillmentMode;
exports.getPreOrderSlotsRemaining = getPreOrderSlotsRemaining;
exports.getPurchasableQuantity = getPurchasableQuantity;
exports.assertFulfillmentPurchaseAllowed = assertFulfillmentPurchaseAllowed;
function isComingSoonBlocked(product) {
    if (!product.isComingSoon) {
        return false;
    }
    if (!product.availableAt) {
        return true;
    }
    return product.availableAt.getTime() > Date.now();
}
function isPreOrderProduct(product) {
    return Boolean(product.isPreOrder);
}
function getProductFulfillmentMode(product) {
    if (isComingSoonBlocked(product)) {
        return 'coming_soon';
    }
    if (isPreOrderProduct(product)) {
        return 'pre_order';
    }
    return 'standard';
}
function getPreOrderSlotsRemaining(product) {
    const capacity = product.preOrderCapacity ?? 0;
    const reserved = product.preOrderReserved ?? 0;
    return Math.max(0, capacity - reserved);
}
function getPurchasableQuantity(product) {
    const mode = getProductFulfillmentMode(product);
    if (mode === 'coming_soon') {
        return 0;
    }
    if (mode === 'pre_order') {
        return getPreOrderSlotsRemaining(product);
    }
    return Math.max(0, product.stock);
}
function assertFulfillmentPurchaseAllowed(product, quantity) {
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
//# sourceMappingURL=product-fulfillment.util.js.map