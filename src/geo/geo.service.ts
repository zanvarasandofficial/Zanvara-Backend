import { Injectable, Logger } from '@nestjs/common';
import type { Request } from 'express';
import {
  getClientIp,
  getCountryCodeFromHeaders,
} from '../common/http/request-ip';

export type CheckoutGeoHint = {
  country: string | null;
  countryCode: string | null;
  isPakistan: boolean | null;
  suggestedCountry: string;
  source: 'header' | 'lookup' | 'unknown';
};

const CHECKOUT_COUNTRY_NAMES = [
  'Pakistan',
  'United Arab Emirates',
  'Saudi Arabia',
  'United Kingdom',
  'United States',
  'Canada',
] as const;

const CODE_TO_COUNTRY: Record<string, string> = {
  PK: 'Pakistan',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  GB: 'United Kingdom',
  UK: 'United Kingdom',
  US: 'United States',
  CA: 'Canada',
};

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);
  private readonly cache = new Map<
    string,
    { expiresAt: number; countryCode: string | null; country: string | null }
  >();

  suggestCheckoutCountry(countryCode: string | null, countryName: string | null): string {
    if (countryCode === 'PK' || countryName?.toLowerCase() === 'pakistan') {
      return 'Pakistan';
    }

    const fromCode = countryCode ? CODE_TO_COUNTRY[countryCode] : undefined;
    if (fromCode) {
      return fromCode;
    }

    if (countryName) {
      const match = CHECKOUT_COUNTRY_NAMES.find(
        (name) => name.toLowerCase() === countryName.toLowerCase(),
      );
      if (match) {
        return match;
      }
    }

    return 'Other (International)';
  }

  async resolveCheckoutGeo(req: Request): Promise<CheckoutGeoHint> {
    const headerCode = getCountryCodeFromHeaders(req);
    if (headerCode) {
      const country = CODE_TO_COUNTRY[headerCode] ?? null;
      return {
        countryCode: headerCode,
        country,
        isPakistan: headerCode === 'PK',
        suggestedCountry: this.suggestCheckoutCountry(headerCode, country),
        source: 'header',
      };
    }

    const ip = getClientIp(req);
    if (!ip) {
      return {
        countryCode: null,
        country: null,
        isPakistan: null,
        suggestedCountry: 'Pakistan',
        source: 'unknown',
      };
    }

    const cached = this.cache.get(ip);
    if (cached && cached.expiresAt > Date.now()) {
      return this.buildHint(cached.countryCode, cached.country, 'lookup');
    }

    try {
      const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Geo lookup failed (${response.status})`);
      }

      const payload = (await response.json()) as {
        success?: boolean;
        country?: string;
        country_code?: string;
      };

      const countryCode =
        payload.success && payload.country_code
          ? payload.country_code.toUpperCase()
          : null;
      const country =
        payload.success && payload.country ? payload.country : null;

      this.cache.set(ip, {
        countryCode,
        country,
        expiresAt: Date.now() + 1000 * 60 * 30,
      });

      return this.buildHint(countryCode, country, 'lookup');
    } catch (error) {
      this.logger.warn(
        `Geo lookup failed for ${ip}: ${error instanceof Error ? error.message : error}`,
      );

      return {
        countryCode: null,
        country: null,
        isPakistan: null,
        suggestedCountry: 'Pakistan',
        source: 'unknown',
      };
    }
  }

  private buildHint(
    countryCode: string | null,
    country: string | null,
    source: 'header' | 'lookup',
  ): CheckoutGeoHint {
    return {
      countryCode,
      country,
      isPakistan: countryCode ? countryCode === 'PK' : null,
      suggestedCountry: this.suggestCheckoutCountry(countryCode, country),
      source,
    };
  }
}
