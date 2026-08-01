import type { Request } from 'express';
import type { ConfigService } from '@nestjs/config';
export declare function resolveGoogleCallbackFromRequest(req: Request, configService: ConfigService): string;
