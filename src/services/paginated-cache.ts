import { SET_CACHE_POLICY } from "../constants";
import {
  CacheService,
  HashCacheService,
  PaginationResult,
} from "../interfaces";
import * as objectHelper from "../pkg/object-helper";

export class PaginatedDataCache {
  constructor(
    protected dataName: string,
    protected cacheService: CacheService & HashCacheService
  ) {}

  protected getCacheKey(milestone: string | number, offset: number): string {
    return `${this.dataName}:paginated_data`;
  }

  public async paginateV2(
    milestone: string | number,
    limit: number,
    dataRefresherV2: () => Promise<PaginationResult>,
    options: { expireInSecs: number } = { expireInSecs: 60 * 5 }
  ): Promise<PaginationResult> {
    const cacheKey = this.getCacheKey(milestone, limit);

    const cached = await this.cacheService.get(cacheKey);
    if (cached) return objectHelper.tryParseStringIntoCorrectData(cached);

    const freshData = await dataRefresherV2();

    // Only set cache if not exists, And on set cache, also set TTL
    await this.cacheService.set(cacheKey, JSON.stringify(freshData), {
      policy: SET_CACHE_POLICY.IF_NOT_EXISTS,
      value: options.expireInSecs,
    });

    return freshData;
  }
}
