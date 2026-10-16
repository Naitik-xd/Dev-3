import type { Request, Response } from 'express';
import { getRateLimitStatus } from '../../utils/rateLimiter.ts';

export default async function handler(req: Request, res: Response) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const status = getRateLimitStatus();
  res.setHeader('X-RateLimit-Limit', status.limit.toString());
  res.setHeader('X-RateLimit-Remaining', status.remaining.toString());
  res.setHeader('X-RateLimit-Reset-In', status.resetTimeFormatted);
  return res.json(status);
}
