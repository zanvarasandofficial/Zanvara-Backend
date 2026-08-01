"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveGoogleCallbackFromRequest = resolveGoogleCallbackFromRequest;
const app_urls_1 = require("../config/app-urls");
function resolveGoogleCallbackFromRequest(req, configService) {
    const override = configService.get('OAUTH_CALLBACK_ORIGIN')?.trim();
    if (override) {
        return `${override.replace(/\/$/, '').replace(/\/api$/, '')}/api/auth/google/callback`;
    }
    const host = req.get('host')?.trim();
    if (host && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host)) {
        const protocol = req.protocol === 'https' ? 'https' : 'http';
        return `${protocol}://${host}/api/auth/google/callback`;
    }
    return (0, app_urls_1.resolveGoogleCallbackUrl)(configService);
}
//# sourceMappingURL=google-callback-url.util.js.map