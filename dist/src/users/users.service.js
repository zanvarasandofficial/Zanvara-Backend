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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const role_constant_1 = require("../common/constants/role.constant");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data) {
        return this.prisma.user.create({ data });
    }
    update(id, data) {
        return this.prisma.user.update({ where: { id }, data });
    }
    findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
    }
    findByGoogleId(googleId) {
        return this.prisma.user.findFirst({ where: { googleId } });
    }
    findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    updateRole(id, role) {
        return this.prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                authProvider: true,
                emailVerified: true,
                role: true,
                createdAt: true,
            },
        });
    }
    listStorefrontUsers() {
        return this.prisma.user.findMany({
            where: { role: role_constant_1.Role.USER },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                name: true,
                authProvider: true,
                emailVerified: true,
                createdAt: true,
            },
        });
    }
    toPublicUser(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            authProvider: user.authProvider,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map