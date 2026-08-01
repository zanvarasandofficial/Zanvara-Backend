"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GeoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoService = void 0;
const common_1 = require("@nestjs/common");
const request_ip_1 = require("../common/http/request-ip");
const CHECKOUT_COUNTRY_NAMES = [
    'Pakistan',
    'United Arab Emirates',
    'Saudi Arabia',
    'United Kingdom',
    'United States',
    'Canada',
];
const CODE_TO_COUNTRY = {
    PK: 'Pakistan',
    AE: 'United Arab Emirates',
    SA: 'Saudi Arabia',
    GB: 'United Kingdom',
    UK: 'United Kingdom',
    US: 'United States',
    CA: 'Canada',
};
let GeoService = GeoService_1 = class GeoService {
    logger = new common_1.Logger(GeoService_1.name);
    cache = new Map();
    suggestCheckoutCountry(countryCode, countryName) {
        if (countryCode === 'PK' || countryName?.toLowerCase() === 'pakistan') {
            return 'Pakistan';
        }
        const fromCode = countryCode ? CODE_TO_COUNTRY[countryCode] : undefined;
        if (fromCode) {
            return fromCode;
        }
        if (countryName) {
            const match = CHECKOUT_COUNTRY_NAMES.find((name) => name.toLowerCase() === countryName.toLowerCase());
            if (match) {
                return match;
            }
        }
        return 'Other (International)';
    }
    async resolveCheckoutGeo(req) {
        const headerCode = (0, request_ip_1.getCountryCodeFromHeaders)(req);
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
        const ip = (0, request_ip_1.getClientIp)(req);
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
            const payload = (await response.json());
            const countryCode = payload.success && payload.country_code
                ? payload.country_code.toUpperCase()
                : null;
            const country = payload.success && payload.country ? payload.country : null;
            this.cache.set(ip, {
                countryCode,
                country,
                expiresAt: Date.now() + 1000 * 60 * 30,
            });
            return this.buildHint(countryCode, country, 'lookup');
        }
        catch (error) {
            this.logger.warn(`Geo lookup failed for ${ip}: ${error instanceof Error ? error.message : error}`);
            return {
                countryCode: null,
                country: null,
                isPakistan: null,
                suggestedCountry: 'Pakistan',
                source: 'unknown',
            };
        }
    }
    buildHint(countryCode, country, source) {
        return {
            countryCode,
            country,
            isPakistan: countryCode ? countryCode === 'PK' : null,
            suggestedCountry: this.suggestCheckoutCountry(countryCode, country),
            source,
        };
    }
};
exports.GeoService = GeoService;
exports.GeoService = GeoService = GeoService_1 = __decorate([
    (0, common_1.Injectable)()
], GeoService);
//# sourceMappingURL=geo.service.js.map