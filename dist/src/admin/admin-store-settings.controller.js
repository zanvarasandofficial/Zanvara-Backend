"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminStoreSettingsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const role_constant_1 = require("../common/constants/role.constant");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const update_store_settings_dto_1 = require("../settings/dto/update-store-settings.dto");
const store_settings_service_1 = require("../settings/store-settings.service");
let AdminStoreSettingsController = class AdminStoreSettingsController {
    storeSettingsService;
    constructor(storeSettingsService) {
        this.storeSettingsService = storeSettingsService;
    }
    async getStoreSettings() {
        const settings = await this.storeSettingsService.getStoreSettings();
        return this.storeSettingsService.toPublicSettings(settings);
    }
    updateStoreSettings(dto) {
        return this.storeSettingsService.updateStoreSettings(dto);
    }
};
exports.AdminStoreSettingsController = AdminStoreSettingsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminStoreSettingsController.prototype, "getStoreSettings", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_store_settings_dto_1.UpdateStoreSettingsDto]),
    __metadata("design:returntype", void 0)
], AdminStoreSettingsController.prototype, "updateStoreSettings", null);
exports.AdminStoreSettingsController = AdminStoreSettingsController = __decorate([
    (0, common_1.Controller)('admin/store-settings'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_constant_1.Role.ADMIN),
    __metadata("design:paramtypes", [store_settings_service_1.StoreSettingsService])
], AdminStoreSettingsController);
//# sourceMappingURL=admin-store-settings.controller.js.map