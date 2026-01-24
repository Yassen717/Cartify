import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

class RedisClient {
    private client: RedisClientType | null = null;
    private isConnected: boolean = false;

    async connect(): Promise<void> {
        try {
            // Only connect if Redis URL is provided
            const redisUrl = process.env.REDIS_URL;
            
            if (!redisUrl) {
                logger.warn('Redis URL not provided. Caching will be disabled.');
                return;
            }

            this.client = createClient({
                url: redisUrl,
                socket: {
                    reconnectStrategy: (retries: number) => {
                        if (retries > 10) {
                            logger.error('Redis: Max reconnection attempts reached');
                            return new Error('Max reconnection attempts reached');
                        }
                        return Math.min(retries * 100, 3000);
                    },
                },
            });

            this.client.on('error', (err: Error) => {
                logger.error('Redis Client Error:', err);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                logger.info('Redis: Connecting...');
            });

            this.client.on('ready', () => {
                logger.info('✅ Redis: Connected and ready');
                this.isConnected = true;
            });

            this.client.on('reconnecting', () => {
                logger.warn('Redis: Reconnecting...');
                this.isConnected = false;
            });

            this.client.on('end', () => {
                logger.info('Redis: Connection closed');
                this.isConnected = false;
            });

            await this.client.connect();
        } catch (error) {
            logger.error('Failed to connect to Redis:', error);
            this.client = null;
            this.isConnected = false;
        }
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            try {
                await this.client.quit();
                logger.info('Redis: Disconnected gracefully');
            } catch (error) {
                logger.error('Error disconnecting from Redis:', error);
            }
        }
    }

    getClient(): RedisClientType | null {
        return this.client;
    }

    isReady(): boolean {
        return this.isConnected && this.client !== null;
    }

    // Get value from cache
    async get(key: string): Promise<string | null> {
        if (!this.isReady()) return null;
        
        try {
            const result = await this.client!.get(key);
            return result as string | null;
        } catch (error) {
            logger.error(`Redis GET error for key ${key}:`, error);
            return null;
        }
    }

    // Set value in cache with optional TTL (in seconds)
    async set(key: string, value: string, ttl?: number): Promise<boolean> {
        if (!this.isReady()) return false;
        
        try {
            if (ttl) {
                await this.client!.setEx(key, ttl, value);
            } else {
                await this.client!.set(key, value);
            }
            return true;
        } catch (error) {
            logger.error(`Redis SET error for key ${key}:`, error);
            return false;
        }
    }

    // Delete key from cache
    async del(key: string): Promise<boolean> {
        if (!this.isReady()) return false;
        
        try {
            await this.client!.del(key);
            return true;
        } catch (error) {
            logger.error(`Redis DEL error for key ${key}:`, error);
            return false;
        }
    }

    // Delete multiple keys matching a pattern
    async delPattern(pattern: string): Promise<number> {
        if (!this.isReady()) return 0;
        
        try {
            const keys = await this.client!.keys(pattern);
            if (keys.length === 0) return 0;
            
            await this.client!.del(keys);
            return keys.length;
        } catch (error) {
            logger.error(`Redis DEL pattern error for ${pattern}:`, error);
            return 0;
        }
    }

    // Clear all cache
    async flushAll(): Promise<boolean> {
        if (!this.isReady()) return false;
        
        try {
            await this.client!.flushAll();
            logger.info('Redis: All cache cleared');
            return true;
        } catch (error) {
            logger.error('Redis FLUSHALL error:', error);
            return false;
        }
    }

    // Get cache statistics
    async getStats(): Promise<any> {
        if (!this.isReady()) {
            return {
                connected: false,
                message: 'Redis not connected',
            };
        }
        
        try {
            const info = await this.client!.info('stats');
            const dbSize = await this.client!.dbSize();
            
            return {
                connected: true,
                dbSize,
                info: this.parseRedisInfo(info),
            };
        } catch (error) {
            logger.error('Redis STATS error:', error);
            return {
                connected: false,
                error: 'Failed to get stats',
            };
        }
    }

    private parseRedisInfo(info: string): Record<string, string> {
        const lines = info.split('\r\n');
        const stats: Record<string, string> = {};
        
        for (const line of lines) {
            if (line && !line.startsWith('#')) {
                const [key, value] = line.split(':');
                if (key && value) {
                    stats[key] = value;
                }
            }
        }
        
        return stats;
    }
}

// Export singleton instance
export const redisClient = new RedisClient();
export default redisClient;
