"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOrderPaymentRequirement = calculateOrderPaymentRequirement;
exports.enrichLinesWithDeliveryPayment = enrichLinesWithDeliveryPayment;
exports.validatePaymentForDeliveryRequirement = validatePaymentForDeliveryRequirement;
exports.resolveSubmittedPaymentMethod = resolveSubmittedPaymentMethod;
const common_1 = require("@nestjs/common");
const delivery_options_util_1 = require("../products/delivery-options.util");
const payment_rules_util_1 = require("./payment-rules.util");
function roundMoney(value) {
    return Math.round(value);
}
function calculateOrderPaymentRequirement(lines, total, qualifiesForFreeDelivery) {
    let onlineDue = 0;
    for (const line of lines) {
        const percent = line.onlinePaymentPercent ?? 0;
        if (percent <= 0) {
            continue;
        }
        const lineSubtotal = line.price * line.quantity;
        const lineDelivery = !qualifiesForFreeDelivery && line.deliveryCharge > 0
            ? line.deliveryCharge
            : 0;
        const lineTotal = lineSubtotal + lineDelivery;
        onlineDue += lineTotal * (percent / 100);
    }
    onlineDue = roundMoney(Math.min(total, onlineDue));
    const balanceOnDelivery = roundMoney(Math.max(0, total - onlineDue));
    if (onlineDue >= total - 0.01) {
        return {
            onlinePaymentDue: roundMoney(total),
            balanceOnDelivery: 0,
            mode: 'full_online',
        };
    }
    if (onlineDue > 0.01) {
        return {
            onlinePaymentDue: onlineDue,
            balanceOnDelivery,
            mode: 'partial_online',
        };
    }
    return {
        onlinePaymentDue: 0,
        balanceOnDelivery: roundMoney(total),
        mode: 'cod_ok',
    };
}
function enrichLinesWithDeliveryPayment(items, productMap, qualifiesForFreeDelivery) {
    return items.map((item) => {
        const product = productMap.get(item.productId);
        const deliveryOptions = (0, delivery_options_util_1.resolveDeliveryOptionsFromProduct)(product);
        const selectedOption = (0, delivery_options_util_1.getDeliveryOptionById)(deliveryOptions, item.deliveryOptionId) ??
            (0, delivery_options_util_1.getDefaultDeliveryOption)(deliveryOptions);
        const deliveryCharge = qualifiesForFreeDelivery ? 0 : selectedOption.charge;
        return {
            ...item,
            deliveryCharge,
            onlinePaymentPercent: selectedOption.onlinePaymentPercent ?? 0,
        };
    });
}
function validatePaymentForDeliveryRequirement(paymentMethod, requirement, countryCode) {
    const method = (0, payment_rules_util_1.validatePaymentForCountry)(paymentMethod, countryCode);
    if (requirement.mode === 'full_online') {
        if (!(0, payment_rules_util_1.isOnlinePaymentMethod)(method)) {
            throw new common_1.BadRequestException('The selected delivery option requires full online payment before dispatch.');
        }
        return method;
    }
    if (requirement.mode === 'partial_online') {
        if ((0, payment_rules_util_1.isCashOnDeliveryPayment)(method)) {
            throw new common_1.BadRequestException(`Pay ${requirement.onlinePaymentDue} online first for the selected delivery option. Choose partial online + COD or full online payment.`);
        }
        if (!(0, payment_rules_util_1.isOnlinePaymentMethod)(method) && !(0, payment_rules_util_1.isPartialOnlinePaymentMethod)(method)) {
            throw new common_1.BadRequestException('Choose partial online + COD or full online payment for this delivery option.');
        }
        return method;
    }
    return method;
}
function resolveSubmittedPaymentMethod(paymentMethod, requirement) {
    if (requirement.mode === 'partial_online' && (0, payment_rules_util_1.isOnlinePaymentMethod)(paymentMethod)) {
        return payment_rules_util_1.PAYMENT_METHOD_ONLINE;
    }
    if (requirement.mode === 'partial_online' &&
        !(0, payment_rules_util_1.isPartialOnlinePaymentMethod)(paymentMethod) &&
        !(0, payment_rules_util_1.isOnlinePaymentMethod)(paymentMethod)) {
        return payment_rules_util_1.PAYMENT_METHOD_PARTIAL;
    }
    return paymentMethod?.trim() || payment_rules_util_1.PAYMENT_METHOD_PARTIAL;
}
//# sourceMappingURL=delivery-payment.util.js.map