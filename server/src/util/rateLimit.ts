import { FastifyReply, FastifyRequest } from "fastify";

type RateLimitInfo = {
  ipRequestCounts: Map<string, { count: number; resetTime: number }>,
  rateLimit: { timeout: number, maxCount: number },
};

type RateLimitConfig = {
  requestSignupCode: RateLimitInfo,
  register: RateLimitInfo,
};

export const rateLimitConfig: RateLimitConfig = {
  requestSignupCode: {
    ipRequestCounts: new Map(),
    rateLimit: {
      timeout: 15 * 60 * 1000, // 15 minutes
      maxCount: 3
    },
  },
  register: {
    ipRequestCounts: new Map(),
    rateLimit: {
      timeout: 15 * 60 * 1000, // 15 minutes
      maxCount: 9
    },
  },
};

function getRateLimitTimeRemaining(
  rateLimitInfo: RateLimitInfo,
  clientIP: string,
): number | null {
  const { ipRequestCounts, rateLimit } = rateLimitInfo;
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

export function verifyRateLimit(
  request: FastifyRequest,
  reply: FastifyReply,
  rateLimitInfo: RateLimitInfo,
): boolean {
  const overrideRateLimit: boolean = (request as any).overrideRateLimit;
  if (overrideRateLimit) {
    return true;
  }
  const timeRemaining = getRateLimitTimeRemaining(rateLimitInfo, request.ip);
  if (timeRemaining !== null) {
    reply.code(429).send({
      error: "Too many requests. Please try again later.",
      timeRemaining,
    });
    return false;
  }
  return true;
}
