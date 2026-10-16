// src/utils/rateLimiter.ts
var MAX_REQUESTS = 80;
var WINDOW_MS = 5 * 60 * 60 * 1e3;
var requestTimestamps = [];
function formatDuration(ms) {
  if (ms <= 0) return "now";
  const totalMinutes = Math.ceil(ms / (1e3 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
function cleanOldTimestamps(now = Date.now()) {
  const cutoff = now - WINDOW_MS;
  while (requestTimestamps.length > 0 && requestTimestamps[0] <= cutoff) {
    requestTimestamps.shift();
  }
}
function getRateLimitStatus(now = Date.now()) {
  cleanOldTimestamps(now);
  const totalUsed = requestTimestamps.length;
  const remaining = Math.max(0, MAX_REQUESTS - totalUsed);
  const isLimited = totalUsed >= MAX_REQUESTS;
  let resetInMs = 0;
  if (isLimited && requestTimestamps.length > 0) {
    const oldest = requestTimestamps[0];
    resetInMs = Math.max(0, oldest + WINDOW_MS - now);
  }
  return {
    allowed: !isLimited,
    remaining,
    limit: MAX_REQUESTS,
    resetInMs,
    resetTimeFormatted: formatDuration(resetInMs),
    totalUsed,
    isLimited
  };
}

// src/api/substitution/rate-limit.ts
async function handler(req, res) {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  const status = getRateLimitStatus();
  res.setHeader("X-RateLimit-Limit", status.limit.toString());
  res.setHeader("X-RateLimit-Remaining", status.remaining.toString());
  res.setHeader("X-RateLimit-Reset-In", status.resetTimeFormatted);
  return res.json(status);
}
export {
  handler as default
};
