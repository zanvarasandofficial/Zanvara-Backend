import { BadRequestException } from '@nestjs/common';
import type { Product } from '@prisma/client';
import {
  getDefaultDeliveryOption,
  getDeliveryOptionById,
  resolveDeliveryOptionsFromProduct,
} from '../products/delivery-options.util';
import {
  isCashOnDeliveryPayment,
  isOnlinePaymentMethod,
  isPartialOnlinePaymentMethod,
  PAYMENT_METHOD_ONLINE,
  PAYMENT_METHOD_PARTIAL,
  validatePaymentForCountry,
} from './payment-rules.util';

type OrderLineInput = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  deliveryOptionId?: string;
};

type EnrichedLine = OrderLineInput & {
  deliveryCharge: number;
  onlinePaymentPercent: number;
};

export type OrderPaymentRequirement = {
  onlinePaymentDue: number;
  balanceOnDelivery: number;
  mode: 'cod_ok' | 'partial_online' | 'full_online';
};

function roundMoney(value: number) {
  return Math.round(value);
}

export function calculateOrderPaymentRequirement(
  lines: EnrichedLine[],
  total: number,
  qualifiesForFreeDelivery: boolean,
): OrderPaymentRequirement {
  let onlineDue = 0;

  for (const line of lines) {
    const percent = line.onlinePaymentPercent ?? 0;
    if (percent <= 0) {
      continue;
    }

    const lineSubtotal = line.price * line.quantity;
    const lineDelivery =
      !qualifiesForFreeDelivery && line.deliveryCharge > 0
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

export function enrichLinesWithDeliveryPayment(
  items: OrderLineInput[],
  productMap: Map<string, Product>,
  qualifiesForFreeDelivery: boolean,
) {
  return items.map((item) => {
    const product = productMap.get(item.productId)!;
    const deliveryOptions = resolveDeliveryOptionsFromProduct(product);
    const selectedOption =
      getDeliveryOptionById(deliveryOptions, item.deliveryOptionId) ??
      getDefaultDeliveryOption(deliveryOptions);

    const deliveryCharge = qualifiesForFreeDelivery ? 0 : selectedOption.charge;

    return {
      ...item,
      deliveryCharge,
      onlinePaymentPercent: selectedOption.onlinePaymentPercent ?? 0,
    };
  });
}

export function validatePaymentForDeliveryRequirement(
  paymentMethod: string | undefined | null,
  requirement: OrderPaymentRequirement,
  countryCode: string | null,
) {
  const method = validatePaymentForCountry(paymentMethod, countryCode);

  if (requirement.mode === 'full_online') {
    if (!isOnlinePaymentMethod(method)) {
      throw new BadRequestException(
        'The selected delivery option requires full online payment before dispatch.',
      );
    }
    return method;
  }

  if (requirement.mode === 'partial_online') {
    if (isCashOnDeliveryPayment(method)) {
      throw new BadRequestException(
        `Pay ${requirement.onlinePaymentDue} online first for the selected delivery option. Choose partial online + COD or full online payment.`,
      );
    }

    if (!isOnlinePaymentMethod(method) && !isPartialOnlinePaymentMethod(method)) {
      throw new BadRequestException(
        'Choose partial online + COD or full online payment for this delivery option.',
      );
    }

    return method;
  }

  return method;
}

export function resolveSubmittedPaymentMethod(
  paymentMethod: string | undefined | null,
  requirement: OrderPaymentRequirement,
) {
  if (requirement.mode === 'partial_online' && isOnlinePaymentMethod(paymentMethod)) {
    return PAYMENT_METHOD_ONLINE;
  }

  if (
    requirement.mode === 'partial_online' &&
    !isPartialOnlinePaymentMethod(paymentMethod) &&
    !isOnlinePaymentMethod(paymentMethod)
  ) {
    return PAYMENT_METHOD_PARTIAL;
  }

  return paymentMethod?.trim() || PAYMENT_METHOD_PARTIAL;
}
