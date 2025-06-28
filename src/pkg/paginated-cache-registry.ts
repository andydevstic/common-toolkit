import { CacheService, IPaginatedDataCache } from "../interfaces";
import { PaginatedDataCache } from "../services/paginated-cache";

export class PaginatedCacheRegistry {
  protected _registry = new Map<string, IPaginatedDataCache>();

  constructor(protected cacheService: CacheService) {}

  public createPaginatedCache<T = any>(
    dataName: string
  ): IPaginatedDataCache<T> {
    if (this._registry.has(dataName)) {
      return this._registry.get(dataName);
    }

    const service = new PaginatedDataCache(dataName, this.cacheService);
    this._registry.set(dataName, service);

    return service;
  }
}
