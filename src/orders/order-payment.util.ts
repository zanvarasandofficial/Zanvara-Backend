export function roundOrderMoney(value: number) {
  return Math.round(value);
}

export function getRequiredOnlinePercent(onlinePaymentDue: number, total: number) {
  if (onlinePaymentDue <= 0 || total <= 0) {
    return 0;
  }

  return Math.round((onlinePaymentDue / total) * 100);
}

export function getPaymentRemaining(due: number, received: number) {
  return Math.max(0, roundOrderMoney(due - received));
}

export type PaymentCollectionStatus =
  | 'not_required'
  | 'pending'
  | 'partial'
  | 'received';

export function getPaymentCollectionStatus(
  due: number,
  received: number,
): PaymentCollectionStatus {
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

export function getLineOnlineAdvanceAmount(item: {
  price: number;
  quantity: number;
  deliveryCharge?: number;
  onlinePaymentPercent?: number;
}) {
  const percent = Number(item.onlinePaymentPercent ?? 0);
  if (percent <= 0) {
    return 0;
  }

  const lineSubtotal = item.price * item.quantity;
  const lineDelivery = Math.max(0, Number(item.deliveryCharge ?? 0));
  const lineTotal = lineSubtotal + lineDelivery;

  return roundOrderMoney(lineTotal * (percent / 100));
}

/** @deprecated use getPaymentRemaining */
export const getOnlinePaymentRemaining = getPaymentRemaining;

/** @deprecated use getPaymentCollectionStatus */
export const getOnlinePaymentCollectionStatus = getPaymentCollectionStatus;

/** @deprecated use PaymentCollectionStatus */
export type OnlinePaymentCollectionStatus = PaymentCollectionStatus;
