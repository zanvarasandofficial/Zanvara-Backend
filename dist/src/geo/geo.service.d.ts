import type { Request } from 'express';
export type CheckoutGeoHint = {
    country: string | null;
    countryCode: string | null;
    isPakistan: boolean | null;
    suggestedCountry: string;
    source: 'header' | 'lookup' | 'unknown';
};
export declare class GeoService {
    private readonly logger;
    private readonly cache;
    suggestCheckoutCountry(countryCode: string | null, countryName: string | null): string;
    resolveCheckoutGeo(req: Request): Promise<CheckoutGeoHint>;
    private buildHint;
}
