/**
 * Global rate limiter for Gemma requests across all IPs.
 * Rule: Maximum 80 requests per 5-hour rolling window.
 */

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetInMs: number;
  resetTimeFormatted: string;
  totalUsed: number;
  isLimited: boolean;
}

const MAX_REQUESTS = 80;
const WINDOW_MS = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

// Global in-memory storage of request timestamps
const requestTimestamps: number[] = [];

/**
 * Format remaining milliseconds into human-readable format like "4h 32m" or "15m"
 */
export function formatDuration(ms: number): string {
  if (ms <= 0) return 'now';
  const totalMinutes = Math.ceil(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Clean up timestamps older than the 5-hour rolling window.
 */
function cleanOldTimestamps(now: number = Date.now()): void {
  const cutoff = now - WINDOW_MS;
  while (requestTimestamps.length > 0 && requestTimestamps[0] <= cutoff) {
    requestTimestamps.shift();
  }
}

/**
 * Check current rate limit status without consuming a request token.
 */
export function getRateLimitStatus(now: number = Date.now()): RateLimitStatus {
  cleanOldTimestamps(now);

  const totalUsed = requestTimestamps.length;
  const remaining = Math.max(0, MAX_REQUESTS - totalUsed);
  const isLimited = totalUsed >= MAX_REQUESTS;

  let resetInMs = 0;
  if (isLimited && requestTimestamps.length > 0) {
    const oldest = requestTimestamps[0];
    resetInMs = Math.max(0, (oldest + WINDOW_MS) - now);
  }

  return {
    allowed: !isLimited,
    remaining,
    limit: MAX_REQUESTS,
    resetInMs,
    resetTimeFormatted: formatDuration(resetInMs),
    totalUsed,
    isLimited,
  };
}

/**
 * Consume a rate limit slot if available.
 * Returns the status after consumption, or refusal if limit is reached.
 */
export function tryConsumeRateLimit(now: number = Date.now()): RateLimitStatus {
  cleanOldTimestamps(now);

  const totalUsed = requestTimestamps.length;
  if (totalUsed >= MAX_REQUESTS) {
    const oldest = requestTimestamps[0];
    const resetInMs = Math.max(0, (oldest + WINDOW_MS) - now);
    return {
      allowed: false,
      remaining: 0,
      limit: MAX_REQUESTS,
      resetInMs,
      resetTimeFormatted: formatDuration(resetInMs),
      totalUsed,
      isLimited: true,
    };
  }

  // Consume a token
  requestTimestamps.push(now);
  const newUsed = requestTimestamps.length;
  const remaining = Math.max(0, MAX_REQUESTS - newUsed);

  return {
    allowed: true,
    remaining,
    limit: MAX_REQUESTS,
    resetInMs: 0,
    resetTimeFormatted: '0m',
    totalUsed: newUsed,
    isLimited: false,
  };
}

/**
 * For diagnostic or test purposes
 */
export function resetRateLimitStore(): void {
  requestTimestamps.length = 0;
}
