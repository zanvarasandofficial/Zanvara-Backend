import type { Request } from 'express';
export declare function getClientIp(req: Request): string | null;
export declare function getCountryCodeFromHeaders(req: Request): string | null;
