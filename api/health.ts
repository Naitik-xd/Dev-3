import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.status(200).json({ 
    status: 'ok', 
    version: '1.0.0-beta', 
    model: 'gemma-4-26b-a4b-it',
    availableFamily: 'Gemma (Gemma 4 priority, Gemma 2 fallback)',
    models: ['gemma-4-26b-a4b-it', 'gemma-4-31b-it', 'gemma-2-27b-it', 'gemma-2-9b-it'],
    timestamp: new Date().toISOString() 
  });
}
