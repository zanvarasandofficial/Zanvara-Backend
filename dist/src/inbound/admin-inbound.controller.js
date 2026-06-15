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
exports.AdminInboundController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const role_constant_1 = require("../common/constants/role.constant");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const update_inbound_status_dto_1 = require("./dto/update-inbound-status.dto");
const inbound_service_1 = require("./inbound.service");
let AdminInboundController = class AdminInboundController {
    inboundService;
    constructor(inboundService) {
        this.inboundService = inboundService;
    }
    findAll(type) {
        return this.inboundService.findAllAdmin(type);
    }
    updateStatus(id, dto) {
        return this.inboundService.updateStatus(id, dto.status);
    }
};
exports.AdminInboundController = AdminInboundController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminInboundController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_inbound_status_dto_1.UpdateInboundStatusDto]),
    __metadata("design:returntype", void 0)
], AdminInboundController.prototype, "updateStatus", null);
exports.AdminInboundController = AdminInboundController = __decorate([
    (0, common_1.Controller)('admin/inbound'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_constant_1.Role.ADMIN),
    __metadata("design:paramtypes", [inbound_service_1.InboundService])
], AdminInboundController);
//# sourceMappingURL=admin-inbound.controller.js.map