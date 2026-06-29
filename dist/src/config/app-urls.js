"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveGoogleCallbackUrl = resolveGoogleCallbackUrl;
exports.resolveFrontendUrl = resolveFrontendUrl;
function parseUrlList(value) {
    return (value ?? '')
        .split(',')
        .map((item) => item.trim().replace(/\/$/, ''))
        .filter(Boolean);
}
function resolveGoogleCallbackUrl(configService) {
    const explicit = configService.get('GOOGLE_CALLBACK_URL')?.trim();
    if (explicit && !explicit.includes('localhost')) {
        return explicit;
    }
    const vercelUrl = configService.get('VERCEL_URL')?.trim();
    if (vercelUrl) {
        return `https://${vercelUrl}/api/auth/google/callback`;
    }
    if (explicit) {
        return explicit;
    }
    const port = configService.get('PORT') ?? '4000';
    return `http://localhost:${port}/api/auth/google/callback`;
}
function resolveFrontendUrl(configService) {
    const origins = parseUrlList(configService.get('FRONTEND_URL') ?? 'http://localhost:3000');
    const liveOrigin = origins.find((origin) => origin.startsWith('https://') && !origin.includes('localhost'));
    if (liveOrigin) {
        return liveOrigin;
    }
    return origins[0] ?? 'http://localhost:3000';
}
//# sourceMappingURL=app-urls.js.map