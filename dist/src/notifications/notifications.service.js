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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
let NotificationsService = class NotificationsService {
    prisma;
    mailService;
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async notifyAdmin(input) {
        const notification = await this.prisma.adminNotification.create({
            data: {
                type: input.type,
                title: input.title,
                message: input.message,
                linkPath: input.linkPath ?? null,
                referenceId: input.referenceId ?? null,
            },
        });
        await this.mailService.sendAdminAlert(input.emailSubject, input.emailText, input.emailHtml);
        return notification;
    }
    findAll() {
        return this.prisma.adminNotification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    unreadCount() {
        return this.prisma.adminNotification.count({
            where: { read: false },
        });
    }
    markRead(id) {
        return this.prisma.adminNotification.update({
            where: { id },
            data: { read: true },
        });
    }
    markAllRead() {
        return this.prisma.adminNotification.updateMany({
            where: { read: false },
            data: { read: true },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map