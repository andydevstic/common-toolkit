import * as ioredis from "ioredis";

import { CacheService, SetCacheOption } from "../interfaces";
import { SET_CACHE_POLICY } from "../constants";

export class RedisService implements CacheService {
  protected _redis: ioredis.Redis;

  constructor(config: ioredis.RedisOptions) {
    this._redis = new ioredis.Redis(config);
  }

  public get(key: string): Promise<any> {
    return this._redis.get(key);
  }

  public set(key: string, value: any, option: SetCacheOption): Promise<any> {
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

  public decrBy(key: string, value = 1): Promise<any> {
    return this._redis.decrby(key, value);
  }
}
