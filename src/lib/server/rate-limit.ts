/**
 * Simple in-memory rate limiter.
 * Tracks requests per IP with a sliding window.
 */

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of store) {
		if (now > entry.resetAt) {
			store.delete(key);
		}
	}
}, 5 * 60 * 1000);

export interface RateLimitConfig {
	windowMs: number; // Time window in milliseconds
	maxRequests: number; // Max requests per window
}

export function checkRateLimit(
	identifier: string,
	config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
	const now = Date.now();
	const key = identifier;

	const entry = store.get(key);

	if (!entry || now > entry.resetAt) {
		// Fresh window
		store.set(key, { count: 1, resetAt: now + config.windowMs });
		return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
	}

	if (entry.count >= config.maxRequests) {
		return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
	}

	entry.count++;
	return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetAt - now };
}

// Preset configs
export const RATE_LIMITS = {
	// Script test: 10 per minute
	scriptTest: { windowMs: 60_000, maxRequests: 10 },
	// Script CRUD: 30 per minute
	scriptCrud: { windowMs: 60_000, maxRequests: 30 },
	// Tournament: 2 per minute
	tournament: { windowMs: 60_000, maxRequests: 2 },
	// Auth: 5 per minute
	auth: { windowMs: 60_000, maxRequests: 5 },
	// Friendly match: 5 per minute
	friendlyMatch: { windowMs: 60_000, maxRequests: 5 }
} as const;
