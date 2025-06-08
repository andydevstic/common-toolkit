import * as ioredis from "ioredis";

import {
  CacheScriptEvaluator,
  CacheService,
  HashCacheService,
  ListCacheService,
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

  public async getNumber(key: string): Promise<number | undefined> {
    const result = await this._redis.get(key);
    if (result === null) {
      return undefined;
    }

    const number = parseFloat(result);
    if (isNaN(number)) {
      throw new Error(`Value for key "${key}" is not a valid number.`);
    }

    return number;
  }

  public async del(...keys: string[]): Promise<void> {
    await this._redis.del(...keys);
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

  public async hlen(key: string): Promise<number> {
    return this._redis.hlen(key);
  }

  public set(key: string, value: any, option?: SetCacheOption): Promise<any> {
    if (!option) {
      return this._redis.set(key, value);
    }

    switch (option.policy) {
      case SET_CACHE_POLICY.WITH_TTL:
        return this._redis.set(key, value, "EX", option.value);
      case SET_CACHE_POLICY.KEEP_TTL:
        return this._redis.set(key, value, "KEEPTTL");
      case SET_CACHE_POLICY.IF_EXISTS:
        return this._redis.set(key, value, "XX");
      case SET_CACHE_POLICY.IF_NOT_EXISTS:
        return this._redis.set(key, value, "NX");
      default:
        throw new Error("policy not supported");
    }
  }

  public incrBy(key: string, value = 1): Promise<any> {
    return this._redis.incrby(key, value);
  }

  public incrByFloat(key: string, value: number): Promise<any> {
    return this._redis.incrbyfloat(key, value);
  }

  public decrBy(key: string, value = 1): Promise<any> {
    return this._redis.decrby(key, value);
  }
}
