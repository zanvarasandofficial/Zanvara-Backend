"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnlinePaymentCollectionStatus = exports.getOnlinePaymentRemaining = void 0;
exports.roundOrderMoney = roundOrderMoney;
exports.getRequiredOnlinePercent = getRequiredOnlinePercent;
exports.getPaymentRemaining = getPaymentRemaining;
exports.getPaymentCollectionStatus = getPaymentCollectionStatus;
exports.getLineOnlineAdvanceAmount = getLineOnlineAdvanceAmount;
function roundOrderMoney(value) {
    return Math.round(value);
}
function getRequiredOnlinePercent(onlinePaymentDue, total) {
    if (onlinePaymentDue <= 0 || total <= 0) {
        return 0;
    }
    return Math.round((onlinePaymentDue / total) * 100);
}
function getPaymentRemaining(due, received) {
    return Math.max(0, roundOrderMoney(due - received));
}
function getPaymentCollectionStatus(due, received) {
    if (due <= 0) {
        return 'not_required';
    }
    if (received <= 0) {
        return 'pending';
    }
    if (received >= due - 0.01) {
        return 'received';
    }
    return 'partial';
}
function getLineOnlineAdvanceAmount(item) {
    const percent = Number(item.onlinePaymentPercent ?? 0);
    if (percent <= 0) {
        return 0;
    }
    const lineSubtotal = item.price * item.quantity;
    const lineDelivery = Math.max(0, Number(item.deliveryCharge ?? 0));
    const lineTotal = lineSubtotal + lineDelivery;
    return roundOrderMoney(lineTotal * (percent / 100));
}
exports.getOnlinePaymentRemaining = getPaymentRemaining;
exports.getOnlinePaymentCollectionStatus = getPaymentCollectionStatus;
//# sourceMappingURL=order-payment.util.js.map