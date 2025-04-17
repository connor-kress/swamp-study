export function rateLimitTimeRemaining(
  ipRequestCounts: Map<string, { count: number; resetTime: number }>,
  rateLimit: { timeout: number, maxCount: number },
  clientIP: string,
): number | null {
  const now = Date.now();
  const requestInfo = ipRequestCounts.get(clientIP);
    if (requestInfo) {
      if (now < requestInfo.resetTime) {
        if (requestInfo.count >= rateLimit.maxCount) {
          // Return remaining timeout
          return Math.ceil((requestInfo.resetTime - now) / 1000);
        }
        requestInfo.count++;
      } else {
        // Reset counter if window has passed
        ipRequestCounts.set(clientIP, {
          count: 1,
          resetTime: now + rateLimit.timeout
        });
      }
    } else {
      // First request from this IP
      ipRequestCounts.set(clientIP, {
        count: 1,
        resetTime: now + rateLimit.timeout
      });
  }

  // Clean up old entries periodically
  if (Math.random() < 0.1) { // 10% chance to clean up on each request
    const cleanupTime = now - rateLimit.timeout;
    for (const [ip, info] of ipRequestCounts.entries()) {
      if (info.resetTime < cleanupTime) {
        ipRequestCounts.delete(ip);
      }
    }
  }
  return null;
}
