import type { Request } from 'express';
import { GeoService } from './geo.service';
export declare class GeoController {
    private readonly geoService;
    constructor(geoService: GeoService);
    checkoutHint(req: Request): Promise<import("./geo.service").CheckoutGeoHint>;
}
