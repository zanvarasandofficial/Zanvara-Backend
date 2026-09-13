import { BadRequestException } from '@nestjs/common';
import type { Product } from '@prisma/client';

export type ProductDeliveryOption = {
  id: string;
  label: string;
  charge: number;
  chargeUsd: number | null;
  minDays: number;
  maxDays: number;
  isDefault: boolean;
  enabled: boolean;
  /** 0 = COD allowed, 100 = full online, 1–99 = partial advance online */
  onlinePaymentPercent: number;
};

type LegacyDelivery = Pick<Product, 'deliveryType' | 'deliveryCharge'>;

function slugifyOptionId(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'delivery'
  );
}

function normalizeOption(raw: unknown, index: number): ProductDeliveryOption | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const entry = raw as Record<string, unknown>;
  const label = String(entry.label ?? '').trim();
  if (!label) {
    return null;
  }

  const id = slugifyOptionId(String(entry.id ?? label));
  const charge = Number(entry.charge ?? 0);
  const chargeUsdRaw = entry.chargeUsd;
  const chargeUsd =
    chargeUsdRaw == null || chargeUsdRaw === ''
      ? null
      : Number(chargeUsdRaw);
  const minDays = Number(entry.minDays ?? 0);
  const maxDays = Number(entry.maxDays ?? minDays);

  if (!Number.isFinite(charge) || charge < 0) {
    throw new BadRequestException(`Invalid delivery charge for "${label}".`);
  }

  if (chargeUsd != null && (!Number.isFinite(chargeUsd) || chargeUsd < 0)) {
    throw new BadRequestException(`Invalid USD delivery charge for "${label}".`);
  }

  if (!Number.isFinite(minDays) || minDays < 0 || !Number.isFinite(maxDays) || maxDays < minDays) {
    throw new BadRequestException(`Invalid delivery timeline for "${label}".`);
  }

  const onlinePaymentPercent = normalizeOnlinePaymentPercent(entry.onlinePaymentPercent);

  return {
    id: id || `option-${index + 1}`,
    label,
    charge,
    chargeUsd,
    minDays,
    maxDays,
    isDefault: Boolean(entry.isDefault),
    enabled: entry.enabled !== false,
    onlinePaymentPercent,
  };
}

export function normalizeOnlinePaymentPercent(value: unknown) {
  const percent = Number(value ?? 0);
  if (!Number.isFinite(percent) || percent <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(1, Math.round(percent)));
}

export function normalizeDeliveryOptions(input: unknown[]): ProductDeliveryOption[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new BadRequestException('Add at least one delivery option.');
  }

  const options = input
    .map((entry, index) => normalizeOption(entry, index))
    .filter((entry): entry is ProductDeliveryOption => entry != null);

  if (options.length === 0) {
    throw new BadRequestException('Add at least one valid delivery option.');
  }

  const enabled = options.filter((option) => option.enabled);
  if (enabled.length === 0) {
    throw new BadRequestException('Enable at least one delivery option.');
  }

  const ids = new Set<string>();
  for (const option of options) {
    if (ids.has(option.id)) {
      throw new BadRequestException(`Duplicate delivery option id "${option.id}".`);
    }
    ids.add(option.id);
  }

  const defaultEnabled =
    enabled.find((option) => option.isDefault) ?? enabled[0];

  return options.map((option) => ({
    ...option,
    isDefault: option.id === defaultEnabled.id,
  }));
}

export function resolveDeliveryOptionsFromProduct(
  product: Pick<Product, 'deliveryOptions' | 'deliveryType' | 'deliveryCharge'>,
): ProductDeliveryOption[] {
  const raw = product.deliveryOptions;
  if (Array.isArray(raw) && raw.length > 0) {
    try {
      return normalizeDeliveryOptions(raw as unknown[]);
    } catch {
      // Fall through to legacy mapping if stored data is corrupt.
    }
  }

  const charge =
    product.deliveryType === 'CHARGED' && product.deliveryCharge != null
      ? product.deliveryCharge
      : 0;

  return [
    {
      id: 'standard',
      label: 'Standard Delivery',
      charge,
      chargeUsd: null,
      minDays: 3,
      maxDays: 5,
      isDefault: true,
      enabled: true,
      onlinePaymentPercent: 0,
    },
  ];
}

export function getDefaultDeliveryOption(
  options: ProductDeliveryOption[],
): ProductDeliveryOption {
  return (
    options.find((option) => option.enabled && option.isDefault) ??
    options.find((option) => option.enabled) ??
    options[0]
  );
}

export function getDeliveryOptionById(
  options: ProductDeliveryOption[],
  id?: string | null,
): ProductDeliveryOption | null {
  if (!id) {
    return null;
  }

  return options.find((option) => option.id === id && option.enabled) ?? null;
}

export function deriveLegacyDeliveryFields(options: ProductDeliveryOption[]) {
  const selected = getDefaultDeliveryOption(options);

  if (selected.charge > 0) {
    return {
      deliveryType: 'CHARGED' as const,
      deliveryCharge: selected.charge,
    };
  }

  return {
    deliveryType: 'FREE' as const,
    deliveryCharge: null,
  };
}

export function resolveProductDeliveryInput(input: {
  deliveryOptions?: unknown[] | null;
  deliveryType?: string;
  deliveryCharge?: number | null;
}) {
  if (input.deliveryOptions?.length) {
    const deliveryOptions = normalizeDeliveryOptions(input.deliveryOptions);
    return {
      deliveryOptions,
      ...deriveLegacyDeliveryFields(deliveryOptions),
    };
  }

  const legacy = deriveLegacyDeliveryFields(
    resolveDeliveryOptionsFromProduct({
      deliveryOptions: null,
      deliveryType: input.deliveryType ?? 'FREE',
      deliveryCharge: input.deliveryCharge ?? null,
    }),
  );

  const deliveryOptions = resolveDeliveryOptionsFromProduct({
    deliveryOptions: null,
    deliveryType: legacy.deliveryType,
    deliveryCharge: legacy.deliveryCharge,
  });

  return {
    deliveryOptions,
    ...legacy,
  };
}

export function formatDeliveryEta(minDays: number, maxDays: number) {
  if (minDays <= 0 && maxDays <= 0) {
    return 'Delivery time confirmed after order';
  }

  if (minDays === maxDays) {
    return `${minDays} business day${minDays === 1 ? '' : 's'}`;
  }

  return `${minDays}–${maxDays} business days`;
}
