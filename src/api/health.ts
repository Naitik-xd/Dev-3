import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.json({ 
    status: 'ok', 
    version: '1.0.0-beta', 
    model: 'gemma-4-26b-a4b-it',
    availableFamily: 'Gemma (Gemma 4 priority, Gemma 2 fallback)',
    models: ['gemma-4-26b-a4b-it', 'gemma-4-31b-it', 'gemma-2-27b-it', 'gemma-2-9b-it'],
    timestamp: new Date().toISOString() 
  });
}
