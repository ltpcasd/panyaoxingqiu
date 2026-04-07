import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD', ''),
      db: this.configService.get('REDIS_DB', 0),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });

    this.client.on('error', (error) => {
      console.error('[Redis] Connection error:', error);
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  /**
   * 设置字符串值
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * 设置JSON对象
   */
  async setJson<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  /**
   * 获取字符串值
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * 获取JSON对象
   */
  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * 删除键
   */
  async del(...keys: string[]): Promise<void> {
    await this.client.del(...keys);
  }

  /**
   * 判断键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl);
  }

  /**
   * 获取过期时间
   */
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  /**
   * 递增
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * 递增指定值
   */
  async incrBy(key: string, value: number): Promise<number> {
    return this.client.incrby(key, value);
  }

  /**
   * Hash操作 - 设置字段
   */
  async hset(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  /**
   * Hash操作 - 获取字段
   */
  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  /**
   * Hash操作 - 获取所有字段
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  /**
   * Hash操作 - 删除字段
   */
  async hdel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  /**
   * Set操作 - 添加成员
   */
  async sadd(key: string, ...members: string[]): Promise<void> {
    await this.client.sadd(key, ...members);
  }

  /**
   * Set操作 - 判断成员是否存在
   */
  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.client.sismember(key, member);
    return result === 1;
  }

  /**
   * Set操作 - 删除成员
   */
  async srem(key: string, ...members: string[]): Promise<void> {
    await this.client.srem(key, ...members);
  }

  /**
   * List操作 - 从左推入
   */
  async lpush(key: string, ...values: string[]): Promise<void> {
    await this.client.lpush(key, ...values);
  }

  /**
   * List操作 - 从右弹出
   */
  async rpop(key: string): Promise<string | null> {
    return this.client.rpop(key);
  }

  /**
   * 批量删除匹配的键
   */
  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  /**
   * 获取Redis客户端（用于复杂操作）
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * 获取微信 Access Token（带缓存）
   */
  async getWxAccessToken(): Promise<string | null> {
    return this.get('wx:access_token');
  }

  /**
   * 设置微信 Access Token
   */
  async setWxAccessToken(token: string, expiresIn: number): Promise<void> {
    // 提前5分钟过期
    await this.set('wx:access_token', token, expiresIn - 300);
  }

  /**
   * 获取用户会话
   */
  async getUserSession(openid: string): Promise<Record<string, string> | null> {
    const key = `user:session:${openid}`;
    const session = await this.hgetall(key);
    return Object.keys(session).length > 0 ? session : null;
  }

  /**
   * 设置用户会话
   */
  async setUserSession(openid: string, userId: string, token: string, ttl = 7 * 24 * 3600): Promise<void> {
    const key = `user:session:${openid}`;
    await this.client.hset(key, {
      userId,
      token,
      updatedAt: Date.now().toString(),
    });
    await this.expire(key, ttl);
  }

  /**
   * 删除用户会话
   */
  async deleteUserSession(openid: string): Promise<void> {
    await this.del(`user:session:${openid}`);
  }

  /**
   * 获取配对信息（带缓存）
   */
  async getCoupleInfo(coupleId: string): Promise<string | null> {
    return this.get(`couple:info:${coupleId}`);
  }

  /**
   * 设置配对信息缓存
   */
  async setCoupleInfo(coupleId: string, info: Record<string, any>, ttl = 1800): Promise<void> {
    await this.setJson(`couple:info:${coupleId}`, info, ttl);
  }

  /**
   * 获取用户配对ID
   */
  async getUserCoupleId(userId: string): Promise<string | null> {
    return this.get(`couple:users:${userId}`);
  }

  /**
   * 设置用户配对ID缓存
   */
  async setUserCoupleId(userId: string, coupleId: string, ttl = 7 * 24 * 3600): Promise<void> {
    await this.set(`couple:users:${userId}`, coupleId, ttl);
  }

  /**
   * API限流检查
   */
  async checkRateLimit(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const now = Date.now();
    const windowKey = `rate_limit:${key}:${Math.floor(now / windowMs)}`;
    
    const count = await this.incr(windowKey);
    if (count === 1) {
      await this.expire(windowKey, Math.ceil(windowMs / 1000));
    }
    
    const remaining = Math.max(0, limit - count);
    const resetIn = windowMs - (now % windowMs);
    
    return {
      allowed: count <= limit,
      remaining,
      resetIn,
    };
  }
}
