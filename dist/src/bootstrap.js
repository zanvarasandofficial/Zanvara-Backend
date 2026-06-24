"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureNestApp = configureNestApp;
exports.createApp = createApp;
exports.createLocalServer = createLocalServer;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const app_module_1 = require("./app.module");
let cachedServer;
async function configureNestApp(app) {
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: (process.env.FRONTEND_URL ?? 'http://localhost:3000')
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
}
async function createApp() {
    if (cachedServer) {
        return cachedServer;
    }
    const expressApp = (0, express_1.default)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp));
    await configureNestApp(app);
    await app.init();
    cachedServer = expressApp;
    return cachedServer;
}
async function createLocalServer() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await configureNestApp(app);
    return app;
}
//# sourceMappingURL=bootstrap.js.map