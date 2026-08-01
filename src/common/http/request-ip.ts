import type { Request } from 'express';

function normalizeIp(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('::ffff:')) {
    return trimmed.slice(7);
  }

  return trimmed;
}

function isPrivateIp(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return true;
  }

  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('169.254.')) {
    return true;
  }

  const parts = ip.split('.').map(Number);
  if (parts.length === 4 && parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
    return true;
  }

  return false;
}

export function getClientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;

  if (forwardedValue) {
    const first = normalizeIp(forwardedValue.split(',')[0] ?? '');
    if (first && !isPrivateIp(first)) {
      return first;
    }
  }

  const realIp = req.headers['x-real-ip'];
  const realValue = Array.isArray(realIp) ? realIp[0] : realIp;
  if (realValue) {
    const normalized = normalizeIp(realValue);
    if (normalized && !isPrivateIp(normalized)) {
      return normalized;
    }
  }

  const socketIp = normalizeIp(req.socket?.remoteAddress ?? req.ip ?? '');
  if (socketIp && !isPrivateIp(socketIp)) {
    return socketIp;
  }

  return null;
}

export function getCountryCodeFromHeaders(req: Request): string | null {
  const headerNames = [
    'x-vercel-ip-country',
    'cf-ipcountry',
    'cloudfront-viewer-country',
  ];

  for (const name of headerNames) {
    const raw = req.headers[name];
    const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase();

    if (value && value.length === 2 && value !== 'XX' && value !== 'T1') {
      return value;
    }
  }

  return null;
}
