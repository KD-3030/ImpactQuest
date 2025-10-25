/**
 * Simple in-memory cache utility for API responses
 * Helps reduce database load for frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data with TTL (time to live) in milliseconds
   */
  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalidate (delete) cached data
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const cache = new MemoryCache();

// Cache key generators
export const CACHE_KEYS = {
  QUESTS_ALL: 'quests:all',
  QUESTS_ACTIVE: 'quests:active',
  SUBMISSIONS_ALL: 'submissions:all',
  SUBMISSIONS_PENDING: 'submissions:pending',
  USERS_ALL: 'users:all',
  USER_STATS: 'users:stats',
  DASHBOARD_STATS: 'dashboard:stats',
} as const;

// Cache TTL (time to live) constants in milliseconds
export const CACHE_TTL = {
  SHORT: 30000,     // 30 seconds
  MEDIUM: 60000,    // 1 minute
  LONG: 300000,     // 5 minutes
  VERY_LONG: 600000, // 10 minutes
} as const;
