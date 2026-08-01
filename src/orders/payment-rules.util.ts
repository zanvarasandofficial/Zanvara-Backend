import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { getCountryCodeFromHeaders } from '../common/http/request-ip';

export const PAYMENT_METHOD_COD = 'Cash on Delivery (COD)';
export const PAYMENT_METHOD_ONLINE = 'Online Payment (Card)';

export function normalizePaymentMethod(method: string | undefined | null): string {
  return method?.trim() || PAYMENT_METHOD_COD;
}

export function isCashOnDeliveryPayment(method: string | undefined | null): boolean {
  if (!method?.trim()) {
    return true;
  }

  const normalized = method.trim().toLowerCase();
  return (
    normalized.includes('cash on delivery') ||
    normalized.includes('(cod)') ||
    normalized === 'cod'
  );
}

export function isOnlinePaymentMethod(method: string | undefined | null): boolean {
  if (!method?.trim()) {
    return false;
  }

  const normalized = method.trim().toLowerCase();
  return (
    normalized.includes('online payment') ||
    normalized.includes('card') ||
    normalized.includes('bank transfer')
  );
}

export function resolveOrderVisitorCountry(
  dtoCountry: string | undefined,
  req: Request,
): string | null {
  const fromHeaders = getCountryCodeFromHeaders(req);
  if (fromHeaders) {
    return fromHeaders;
  }

  const fromDto = dtoCountry?.trim().toUpperCase();
  return fromDto || null;
}

export function validatePaymentForCountry(
  paymentMethod: string | undefined | null,
  countryCode: string | null,
): string {
  const method = normalizePaymentMethod(paymentMethod);

  if (countryCode && countryCode !== 'PK') {
    if (isCashOnDeliveryPayment(method)) {
      throw new BadRequestException(
        'Cash on delivery is only available for customers in Pakistan.',
      );
    }

    if (!isOnlinePaymentMethod(method)) {
      throw new BadRequestException(
        'International orders must use online payment (card).',
      );
    }
  }

  return method;
}
