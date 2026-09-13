"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOnlinePaymentPercent = normalizeOnlinePaymentPercent;
exports.normalizeDeliveryOptions = normalizeDeliveryOptions;
exports.resolveDeliveryOptionsFromProduct = resolveDeliveryOptionsFromProduct;
exports.getDefaultDeliveryOption = getDefaultDeliveryOption;
exports.getDeliveryOptionById = getDeliveryOptionById;
exports.deriveLegacyDeliveryFields = deriveLegacyDeliveryFields;
exports.resolveProductDeliveryInput = resolveProductDeliveryInput;
exports.formatDeliveryEta = formatDeliveryEta;
const common_1 = require("@nestjs/common");
function slugifyOptionId(value) {
    return (value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'delivery');
}
function normalizeOption(raw, index) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const entry = raw;
    const label = String(entry.label ?? '').trim();
    if (!label) {
        return null;
    }
    const id = slugifyOptionId(String(entry.id ?? label));
    const charge = Number(entry.charge ?? 0);
    const chargeUsdRaw = entry.chargeUsd;
    const chargeUsd = chargeUsdRaw == null || chargeUsdRaw === ''
        ? null
        : Number(chargeUsdRaw);
    const minDays = Number(entry.minDays ?? 0);
    const maxDays = Number(entry.maxDays ?? minDays);
    if (!Number.isFinite(charge) || charge < 0) {
        throw new common_1.BadRequestException(`Invalid delivery charge for "${label}".`);
    }
    if (chargeUsd != null && (!Number.isFinite(chargeUsd) || chargeUsd < 0)) {
        throw new common_1.BadRequestException(`Invalid USD delivery charge for "${label}".`);
    }
    if (!Number.isFinite(minDays) || minDays < 0 || !Number.isFinite(maxDays) || maxDays < minDays) {
        throw new common_1.BadRequestException(`Invalid delivery timeline for "${label}".`);
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
function normalizeOnlinePaymentPercent(value) {
    const percent = Number(value ?? 0);
    if (!Number.isFinite(percent) || percent <= 0) {
        return 0;
    }
    return Math.min(100, Math.max(1, Math.round(percent)));
}
function normalizeDeliveryOptions(input) {
    if (!Array.isArray(input) || input.length === 0) {
        throw new common_1.BadRequestException('Add at least one delivery option.');
    }
    const options = input
        .map((entry, index) => normalizeOption(entry, index))
        .filter((entry) => entry != null);
    if (options.length === 0) {
        throw new common_1.BadRequestException('Add at least one valid delivery option.');
    }
    const enabled = options.filter((option) => option.enabled);
    if (enabled.length === 0) {
        throw new common_1.BadRequestException('Enable at least one delivery option.');
    }
    const ids = new Set();
    for (const option of options) {
        if (ids.has(option.id)) {
            throw new common_1.BadRequestException(`Duplicate delivery option id "${option.id}".`);
        }
        ids.add(option.id);
    }
    const defaultEnabled = enabled.find((option) => option.isDefault) ?? enabled[0];
    return options.map((option) => ({
        ...option,
        isDefault: option.id === defaultEnabled.id,
    }));
}
function resolveDeliveryOptionsFromProduct(product) {
    const raw = product.deliveryOptions;
    if (Array.isArray(raw) && raw.length > 0) {
        try {
            return normalizeDeliveryOptions(raw);
        }
        catch {
        }
    }
    const charge = product.deliveryType === 'CHARGED' && product.deliveryCharge != null
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
function getDefaultDeliveryOption(options) {
    return (options.find((option) => option.enabled && option.isDefault) ??
        options.find((option) => option.enabled) ??
        options[0]);
}
function getDeliveryOptionById(options, id) {
    if (!id) {
        return null;
    }
    return options.find((option) => option.id === id && option.enabled) ?? null;
}
function deriveLegacyDeliveryFields(options) {
    const selected = getDefaultDeliveryOption(options);
    if (selected.charge > 0) {
        return {
            deliveryType: 'CHARGED',
            deliveryCharge: selected.charge,
        };
    }
    return {
        deliveryType: 'FREE',
        deliveryCharge: null,
    };
}
function resolveProductDeliveryInput(input) {
    if (input.deliveryOptions?.length) {
        const deliveryOptions = normalizeDeliveryOptions(input.deliveryOptions);
        return {
            deliveryOptions,
            ...deriveLegacyDeliveryFields(deliveryOptions),
        };
    }
    const legacy = deriveLegacyDeliveryFields(resolveDeliveryOptionsFromProduct({
        deliveryOptions: null,
        deliveryType: input.deliveryType ?? 'FREE',
        deliveryCharge: input.deliveryCharge ?? null,
    }));
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
function formatDeliveryEta(minDays, maxDays) {
    if (minDays <= 0 && maxDays <= 0) {
        return 'Delivery time confirmed after order';
    }
    if (minDays === maxDays) {
        return `${minDays} business day${minDays === 1 ? '' : 's'}`;
    }
    return `${minDays}–${maxDays} business days`;
}
//# sourceMappingURL=delivery-options.util.js.map