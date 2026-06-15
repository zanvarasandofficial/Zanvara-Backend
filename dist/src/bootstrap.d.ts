import { INestApplication } from '@nestjs/common';
import express from 'express';
export declare function configureNestApp(app: INestApplication): Promise<void>;
export declare function createApp(): Promise<express.Express>;
export declare function createLocalServer(): Promise<INestApplication<any>>;
