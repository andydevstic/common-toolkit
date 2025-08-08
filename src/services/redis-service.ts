import * as ioredis from "ioredis";

import {
  CacheScriptEvaluator,
  CacheService,
  HashCacheService,
  ListCacheService,
  LuaCall,
  SetCacheOption,
} from "../interfaces";
import { SET_CACHE_POLICY } from "../constants";

export class RedisService
  implements
    CacheService,
    HashCacheService,
    ListCacheService,
    CacheScriptEvaluator
{
  protected _redis: ioredis.Redis;

  constructor(config: ioredis.RedisOptions) {
    this._redis = new ioredis.Redis(config);
  }

  public get(key: string): Promise<any> {
    return this._redis.get(key);
  }

  public async getNumber(key: string): Promise<number | null> {
    const result = await this._redis.get(key);
    if (result === null) {
      return null;
    }

    return this.convertToNumber(result);
  }

  public async deleteByPattern(pattern: string): Promise<void> {
    let cursor = "0";

    do {
      const [nextCursor, keys] = await this._redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100 // adjust batch size as needed
      );

      cursor = nextCursor;

      if (keys.length > 0) {
        await this._redis.del(...keys);
      }
    } while (cursor !== "0");
  }

  public async del(...keys: string[]): Promise<void> {
    await this._redis.del(...keys);
  }

  public async multiEval(calls: LuaCall[]): Promise<any[]> {
    const multi = this._redis.multi();

    for (const [script, numberOfKeys, ...params] of calls) {
      if (numberOfKeys !== params.slice(0, numberOfKeys).length) {
        throw new Error(
          `numberOfKeys (${numberOfKeys}) does not match key count in params`
        );
      }
      multi.eval(script, numberOfKeys, ...params);
    }

    const execResult = await multi.exec();

    // bubble up the first Redis-side error, if any
    for (const [err] of execResult) {
      if (err) throw err;
    }

    // unwrap the values
    return execResult.map(([, value]) => value);
  }

  public async eval(script: string, numberOfKeys: number, ...args: any[]) {
    return this._redis.eval(script, numberOfKeys, ...args);
  }

  public async hset(key: string, field: string, value: any): Promise<void> {
    await this._redis.hset(key, {
      [field]: value,
    });
  }

  public async lpush(key: string, value: any): Promise<void> {
    await this._redis.lpush(key, value);
  }

  public async lrem(
    key: string,
    count: string | number,
    element: string | Buffer | number
  ): Promise<number> {
    return this._redis.lrem(key, count, element);
  }

  public async rpush(key: string, value: any): Promise<void> {
    await this._redis.rpush(key, value);
  }

  public async lset(key: string, index: number, value: any): Promise<void> {
    await this._redis.lset(key, index, value);
  }

  public async lrange(
    key: string,
    start: number,
    end: number
  ): Promise<string[]> {
    return this._redis.lrange(key, start, end);
  }

  public async lindex(key: string, index: number): Promise<string> {
    return this._redis.lindex(key, index);
  }

  public async llen(key: string): Promise<number> {
    return this._redis.llen(key);
  }

  public async hget(key: string, field: string): Promise<string> {
    return this._redis.hget(key, field);
  }

  public async hincrby(key: string, field: string, value = 1): Promise<number> {
    return this._redis.hincrby(key, field, value);
  }

  public async hincrbyfloat(
    key: string,
    field: string,
    value = 1
  ): Promise<string> {
    return this._redis.hincrbyfloat(key, field, value);
  }

  public async hkeys(key: string): Promise<string[]> {
    return this._redis.hkeys(key);
  }

  public async ttl(key: string): Promise<number> {
    return this._redis.ttl(key);
  }

  public async hlen(key: string): Promise<number> {
    return this._redis.hlen(key);
  }

  public set(key: string, value: any, option?: SetCacheOption): Promise<any> {
    if (!option) {
      return this._redis.set(key, value);
    }

    switch (option.policy) {
      case SET_CACHE_POLICY.WITH_TTL:
        return this._redis.set(key, value, "EX", option.value); // TTL in seconds

      case SET_CACHE_POLICY.KEEP_TTL:
        return this._redis.set(key, value, "KEEPTTL");

      case SET_CACHE_POLICY.IF_EXISTS:
        // Set only if exists, with optional TTL
        return option.value
          ? this._redis.set(key, value, "EX", option.value, "XX")
          : this._redis.set(key, value, "XX");

      case SET_CACHE_POLICY.IF_NOT_EXISTS:
        return option.value
          ? this._redis.set(key, value, "EX", option.value, "NX")
          : this._redis.set(key, value, "NX");

      default:
        throw new Error("policy not supported");
    }
  }

  public async incrBy(key: string, value = 1): Promise<number> {
    const result = await this._redis.incrby(key, value);

    return this.convertToNumber(result);
  }

  protected convertToNumber(value: any): number {
    const number = parseFloat(value);
    if (isNaN(number)) {
      throw new Error(`Value "${value}" is not a valid number.`);
    }
    return number;
  }

  public expire(key: string, ttl: number): Promise<number> {
    return this._redis.expire(key, ttl);
  }

  public async incrByFloat(key: string, value: number): Promise<number> {
    const result = await this._redis.incrbyfloat(key, value);

    return this.convertToNumber(result);
  }

  public async decrBy(key: string, value = 1): Promise<any> {
    const result = await this._redis.decrby(key, value);

    return this.convertToNumber(result);
  }
}
