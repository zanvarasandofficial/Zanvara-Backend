import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot() {
    return {
      name: 'Zanvara Backend API',
      version: '0.1.0',
      docs: {
        health: '/api/health',
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          me: 'GET /api/auth/me',
        },
        admin: 'GET /api/admin/dashboard (ADMIN role required)',
      },
    };
  }
}
