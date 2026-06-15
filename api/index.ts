import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/bootstrap';

let server: Awaited<ReturnType<typeof createApp>> | undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!server) {
    server = await createApp();
  }

  return server(req, res);
}
