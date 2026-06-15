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
exports.InboundController = void 0;
const common_1 = require("@nestjs/common");
const create_contact_dto_1 = require("./dto/create-contact.dto");
const create_newsletter_dto_1 = require("./dto/create-newsletter.dto");
const inbound_service_1 = require("./inbound.service");
let InboundController = class InboundController {
    inboundService;
    constructor(inboundService) {
        this.inboundService = inboundService;
    }
    createContact(dto) {
        return this.inboundService.createContact(dto);
    }
    subscribeNewsletter(dto) {
        return this.inboundService.subscribeNewsletter(dto);
    }
};
exports.InboundController = InboundController;
__decorate([
    (0, common_1.Post)('contact'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_contact_dto_1.CreateContactDto]),
    __metadata("design:returntype", void 0)
], InboundController.prototype, "createContact", null);
__decorate([
    (0, common_1.Post)('newsletter/subscribe'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_newsletter_dto_1.CreateNewsletterDto]),
    __metadata("design:returntype", void 0)
], InboundController.prototype, "subscribeNewsletter", null);
exports.InboundController = InboundController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [inbound_service_1.InboundService])
], InboundController);
//# sourceMappingURL=inbound.controller.js.map