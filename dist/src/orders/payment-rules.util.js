"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_METHOD_ONLINE = exports.PAYMENT_METHOD_COD = void 0;
exports.normalizePaymentMethod = normalizePaymentMethod;
exports.isCashOnDeliveryPayment = isCashOnDeliveryPayment;
exports.isOnlinePaymentMethod = isOnlinePaymentMethod;
exports.resolveOrderVisitorCountry = resolveOrderVisitorCountry;
exports.validatePaymentForCountry = validatePaymentForCountry;
const common_1 = require("@nestjs/common");
const request_ip_1 = require("../common/http/request-ip");
exports.PAYMENT_METHOD_COD = 'Cash on Delivery (COD)';
exports.PAYMENT_METHOD_ONLINE = 'Online Payment (Card)';
function normalizePaymentMethod(method) {
    return method?.trim() || exports.PAYMENT_METHOD_COD;
}
function isCashOnDeliveryPayment(method) {
    if (!method?.trim()) {
        return true;
    }
    const normalized = method.trim().toLowerCase();
    return (normalized.includes('cash on delivery') ||
        normalized.includes('(cod)') ||
        normalized === 'cod');
}
function isOnlinePaymentMethod(method) {
    if (!method?.trim()) {
        return false;
    }
    const normalized = method.trim().toLowerCase();
    return (normalized.includes('online payment') ||
        normalized.includes('card') ||
        normalized.includes('bank transfer'));
}
function resolveOrderVisitorCountry(dtoCountry, req) {
    const fromHeaders = (0, request_ip_1.getCountryCodeFromHeaders)(req);
    if (fromHeaders) {
        return fromHeaders;
    }
    const fromDto = dtoCountry?.trim().toUpperCase();
    return fromDto || null;
}
function validatePaymentForCountry(paymentMethod, countryCode) {
    const method = normalizePaymentMethod(paymentMethod);
    if (countryCode && countryCode !== 'PK') {
        if (isCashOnDeliveryPayment(method)) {
            throw new common_1.BadRequestException('Cash on delivery is only available for customers in Pakistan.');
        }
        if (!isOnlinePaymentMethod(method)) {
            throw new common_1.BadRequestException('International orders must use online payment (card).');
        }
    }
    return method;
}
//# sourceMappingURL=payment-rules.util.js.map