import { CacheService, IPaginatedDataCache } from "../interfaces";
import { PaginatedDataCache } from "../services/paginated-cache";

export class PaginatedCacheRegistry {
  protected _registry = new Map<string, IPaginatedDataCache>();
}
