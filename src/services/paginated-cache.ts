import {
  getVersionCacheKeyForKey,
  getVersionedCacheKey,
} from "../pkg/key-helper";
import {
  CacheService,
  IPaginatedDataCache,
  PaginationResult,
} from "../interfaces";
import * as objectHelper from "../pkg/object-helper";
import { SET_CACHE_POLICY } from "../constants";
import { generateHashFromJSON } from "../pkg/hash-helper";

export class PaginatedDataCache<T = any> implements IPaginatedDataCache<T> {
  constructor(
    protected dataName: string,
    protected cacheService: CacheService
  ) {}

  public _cacheKeyFactory = (
    filter: Record<string, any> = {},
    limit = 10,
    offset = 0
  ): string => {
    const filterString = generateHashFromJSON(filter);

    return `paginated-cache:${this.dataName}:version:_version:filter:${filterString}:limit:${limit}:offset:${offset}`;
  };

  public async getCurrentVersion(cacheKey: string): Promise<number> {
    const result = await this.cacheService.getNumber(
      getVersionCacheKeyForKey(cacheKey)
    );

    return result || 0;
  }

  public async getCachedPaginatedData(
    filter: Record<string, any>,
    limit: number,
    offset: number
  ): Promise<PaginationResult<T>> {
    const cacheKey = this._cacheKeyFactory(filter, limit, offset);
    const { data } = await this._fetchVersionedDataFromCache(cacheKey);

    return data;
  }

  public async setCachedPaginatedData(
    filter: Record<string, any>,
    limit: number,
    offset: number,
    data: PaginationResult<T>,
    ttlInSecs = 60 * 30 // Default TTL is 30 minutes
  ): Promise<void> {
    const cacheKey = this._cacheKeyFactory(filter, limit, offset);
    const currentVersion = await this.getCurrentVersion(cacheKey);
    if (currentVersion === 0) {
      // If current version is 0, we need to increment it first
      await this.incrementCacheVersion(ttlInSecs);
    }

    return this._setVersionedDataInCache(cacheKey, data, ttlInSecs);
  }

  public async _fetchVersionedDataFromCache(
    cacheKey: string,
    _overrideVersion?: number
  ): Promise<{ currentVersion: number; data: PaginationResult<T> | null }> {
    // Example: if cacheKey is 'user:123:profile', the version cache key will be 'user:123:profile:version'
    const currentVersion =
      _overrideVersion ?? (await this.getCurrentVersion(cacheKey));
    if (currentVersion === 0) {
      // Data is not yet set. If data is set, version should be 1
      return {
        currentVersion: 0,
        data: null,
      };
    }

    // Example: if cacheKey is 'user:123:profile' and version is 1, the versioned cache key will be 'user:123:profile:version:1'
    const versionedCacheKey = getVersionedCacheKey(cacheKey, currentVersion);
    const cachedData = await this.cacheService.get(versionedCacheKey);
    if (cachedData) {
      return {
        currentVersion: currentVersion,
        data: objectHelper.tryParseStringIntoCorrectData(cachedData),
      };
    }

    // No data means the cache is stale.
    return {
      currentVersion: currentVersion,
      data: null,
    };
  }

  protected async _setVersionedDataInCache(
    cacheKey: string,
    data: PaginationResult<T>,
    ttl: number = 60 * 30 // Default TTL is 30 minutes
  ): Promise<void> {
    const currentVersion = await this.getCurrentVersion(cacheKey);

    const versionedCacheKey = getVersionedCacheKey(cacheKey, currentVersion);
    const cacheableData =
      typeof data === "object" ? JSON.stringify(data) : data;

    // in case two processes try to set the same versioned cache key at the same time,
    // we use IF_NOT_EXISTS policy to avoid overwriting the cache
    await this.cacheService.set(versionedCacheKey, cacheableData, {
      policy: SET_CACHE_POLICY.IF_NOT_EXISTS,
      value: ttl, // Set versioned cache key to expire in 30 minutes
    });
  }

  public async incrementCacheVersion(ttl = 60 * 60 * 24): Promise<number> {
    const cacheKey = this._cacheKeyFactory();
    const versionCacheKey = getVersionCacheKeyForKey(cacheKey);

    return this.cacheService.incrBy(versionCacheKey, 1, {
      policy: undefined,
      value: ttl,
    });
  }
}
