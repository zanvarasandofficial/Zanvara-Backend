import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';

let server: Express | undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!server) {
    const { createApp } = require('../dist/src/bootstrap') as {
      createApp: () => Promise<Express>;
    };

    server = await createApp();
  }

  return server(req, res);
}
