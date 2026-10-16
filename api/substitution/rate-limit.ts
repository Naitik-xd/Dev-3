import type { Request, Response } from 'express';
import { getRateLimitStatus } from '../../src/utils/rateLimiter.ts';

export default function handler(req: Request, res: Response) {
  const status = getRateLimitStatus();
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-RateLimit-Limit', status.limit.toString());
  res.setHeader('X-RateLimit-Remaining', status.remaining.toString());
  res.setHeader('X-RateLimit-Reset-In', status.resetTimeFormatted);
  return res.status(200).json(status);
}
