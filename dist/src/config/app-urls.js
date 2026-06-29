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
function toAbsoluteBase(url) {
    const trimmed = url.trim().replace(/\/$/, '').replace(/\/api$/, '');
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    return `https://${trimmed}`;
}
function buildGoogleCallbackUrl(base) {
    return `${toAbsoluteBase(base)}/api/auth/google/callback`;
}
function isPreviewVercelHost(hostname) {
    return /-[a-z0-9]+-[^.]+\.vercel\.app$/i.test(hostname);
}
function resolveGoogleCallbackUrl(configService) {
    const explicit = configService.get('GOOGLE_CALLBACK_URL')?.trim();
    if (explicit && !explicit.includes('localhost')) {
        return explicit;
    }
    const stableBackend = configService.get('BACKEND_URL')?.trim() ||
        configService.get('VERCEL_PROJECT_PRODUCTION_URL')?.trim();
    if (stableBackend) {
        return buildGoogleCallbackUrl(stableBackend);
    }
    const vercelUrl = configService.get('VERCEL_URL')?.trim();
    if (vercelUrl && !isPreviewVercelHost(vercelUrl)) {
        return buildGoogleCallbackUrl(vercelUrl);
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