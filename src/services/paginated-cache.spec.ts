import { expect } from "chai";
import { PaginatedDataCache } from "./paginated-cache";
import { generateHashFromJSON } from "../pkg/hash-helper";
import { getVersionCacheKeyForKey } from "../pkg/key-helper";

class FakeCacheService {
  protected _cache: Record<string, any> = {};

  public reset(): void {
    this._cache = {};
  }

  public async get(key: string): Promise<any> {
    return this._cache[key];
  }

  public async set(key: string, value: any, ttlInSecs?: number): Promise<void> {
    this._cache[key] = value;
    // Simulate TTL by not implementing it in this fake service
  }

  public async incrBy(key: string, increment: number): Promise<number> {
    if (this._cache[key] === undefined) {
      this._cache[key] = 0;
    }
    if (typeof this._cache[key] !== "number") {
      throw new Error(`Value for key ${key} is not a number`);
    }
    this._cache[key] += increment;
    return this._cache[key];
  }

  public async getNumber(key: string): Promise<number | null> {
    const value = this._cache[key];
    if (value === undefined) {
      return null;
    }

    return typeof value === "number" ? value : Number(value);
  }
}

var cacheService = new FakeCacheService();
const paginatedDataCache = new PaginatedDataCache("users", cacheService as any);

describe("paginated cache", () => {
  beforeEach(() => {
    cacheService.reset();
  });

  it("should generate cache key correctly", () => {
    const filter = { country: "vietnam", age: 30 };
    const limit = 10;
    const offset = 100;

    const cacheKey = paginatedDataCache._cacheKeyFactory(filter, limit, offset);
    const filterHash = generateHashFromJSON(filter);
    const expectedKey = `paginated-cache:users:version:_version:filter:${filterHash}:limit:${limit}:offset:${offset}`;

    expect(cacheKey).to.equal(
      expectedKey,
      "Cache key should match expected format"
    );
  });

  it("should set and get cached paginated data successfully", async () => {
    const filter = { country: "vietnam", age: 30 };
    const limit = 10;
    const offset = 100;
    const data = {
      rows: [{ id: 1, name: "Andy" }],
      total: 1,
      limit,
      offset,
    };

    const cacheKey = paginatedDataCache._cacheKeyFactory(filter, limit, offset);

    await paginatedDataCache.setCachedPaginatedData(
      filter,
      limit,
      offset,
      data
    );

    const currentVersion = await paginatedDataCache.getCurrentVersion(cacheKey);
    expect(currentVersion).to.equal(1, "Initial version should be 1");

    const cachedData = await paginatedDataCache.getCachedPaginatedData(
      filter,
      limit,
      offset
    );

    const newVersion = await paginatedDataCache.getCurrentVersion(cacheKey);

    expect(newVersion).to.equal(1, "Version should still be 1");
    expect(cachedData).to.deep.equal(data, "Cached data should match set data");
  });

  it("should override existing cache with new data", async () => {
    const filter = { country: "vietnam", age: 30 };
    const limit = 10;
    const offset = 100;
    const data1 = {
      rows: [{ id: 1, name: "Andy" }],
      total: 1,
      limit,
      offset,
    };
    const data2 = {
      rows: [{ id: 2, name: "Bob" }],
      total: 1,
      limit,
      offset,
    };
    const cacheKey = paginatedDataCache._cacheKeyFactory(filter, limit, offset);
    await paginatedDataCache.setCachedPaginatedData(
      filter,
      limit,
      offset,
      data1
    );
    const initialVersion = await paginatedDataCache.getCurrentVersion(cacheKey);
    expect(initialVersion).to.equal(1, "Initial version should be 1");
    const cachedData1 = await paginatedDataCache.getCachedPaginatedData(
      filter,
      limit,
      offset
    );
    expect(cachedData1).to.deep.equal(
      data1,
      "Initial cached data should match"
    );
    await paginatedDataCache.setCachedPaginatedData(
      filter,
      limit,
      offset,
      data2
    );
    const newVersion = await paginatedDataCache.getCurrentVersion(cacheKey);
    expect(newVersion).to.equal(1, "Version should still be 1 after override");
    const cachedData2 = await paginatedDataCache.getCachedPaginatedData(
      filter,
      limit,
      offset
    );
    expect(cachedData2).to.deep.equal(
      data2,
      "Cached data should match new data after override"
    );
  });

  it("should invalidate old cache when increment new version", async () => {
    const filter = { country: "vietnam", age: 30 };
    const filter2 = { country: "usa", age: 25 };
    const limit = 10;
    const offset = 100;
    const cacheKey = paginatedDataCache._cacheKeyFactory(filter, limit, offset);

    const data1 = {
      rows: [{ id: 1, name: "Andy" }],
      total: 1,
      limit,
      offset,
    };
    const data2 = {
      rows: [{ id: 2, name: "Bob" }],
      total: 1,
      limit,
      offset,
    };

    await paginatedDataCache.setCachedPaginatedData(
      filter,
      limit,
      offset,
      data1
    );
    await paginatedDataCache.setCachedPaginatedData(
      filter2,
      limit,
      offset,
      data2
    );

    const initialVersion = await paginatedDataCache.getCurrentVersion(cacheKey);
    expect(initialVersion).to.equal(1, "Initial version should be 1");

    const cachedData1 = await paginatedDataCache.getCachedPaginatedData(
      filter,
      limit,
      offset
    );
    expect(cachedData1).to.deep.equal(
      data1,
      "Initial cached data should match"
    );
    const cachedData2 = await paginatedDataCache.getCachedPaginatedData(
      filter2,
      limit,
      offset
    );

    expect(cachedData2).to.deep.equal(
      data2,
      "Initial cached data2 should match"
    );

    const newVersion = await paginatedDataCache.incrementCacheVersion(cacheKey);

    expect(newVersion).to.equal(2, "Version should be incremented to 2");

    const oldData1 = await paginatedDataCache.getCachedPaginatedData(
      filter,
      limit,
      offset
    );
    const oldData2 = await paginatedDataCache.getCachedPaginatedData(
      filter2,
      limit,
      offset
    );

    expect(oldData1).to.be.null;
    expect(oldData2).to.be.null;
  });

  it("should give different result for different filters", async () => {
    const filter1 = { country: "vietnam", age: 30 };
    const filter2 = { country: "usa", age: 25 };
    const limit = 10;
    const offset = 100;

    const cacheKey1 = paginatedDataCache._cacheKeyFactory(
      filter1,
      limit,
      offset
    );
    const cacheKey2 = paginatedDataCache._cacheKeyFactory(
      filter2,
      limit,
      offset
    );

    const data1 = {
      rows: [{ id: 1, name: "Andy" }],
      total: 1,
      limit,
      offset,
    };

    const data2 = {
      rows: [{ id: 2, name: "Bob" }],
      total: 1,
      limit,
      offset,
    };

    await paginatedDataCache.setCachedPaginatedData(
      filter1,
      limit,
      offset,
      data1
    );

    await paginatedDataCache.setCachedPaginatedData(
      filter2,
      limit,
      offset,
      data2
    );

    const data1Version = await paginatedDataCache.getCurrentVersion(cacheKey1);
    const data2Version = await paginatedDataCache.getCurrentVersion(cacheKey2);

    expect(data1Version).to.equal(1, "Filter1 version should be 1");
    expect(data2Version).to.equal(1, "Filter2 version should be 1");

    const cachedData1 = await paginatedDataCache.getCachedPaginatedData(
      filter1,
      limit,
      offset
    );
    const cachedData2 = await paginatedDataCache.getCachedPaginatedData(
      filter2,
      limit,
      offset
    );

    expect(cachedData1).to.deep.equal(
      data1,
      "Cached data for filter1 should match"
    );
    expect(cachedData2).to.deep.equal(
      data2,
      "Cached data for filter2 should match"
    );
  });

  it("should paginate data correctly", async () => {
    const data = [
      { id: 1, name: "Andy" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
      { id: 4, name: "David" },
      { id: 5, name: "Eve" },
    ];

    const filter = { country: "vietnam", age: 30 };
    const limit = 2;
    const offset = 0;

    const data1 = {
      rows: data.slice(0, limit),
      total: data.length,
      limit,
      offset,
    };

    const data2 = {
      rows: data.slice(limit, limit * 2),
      total: data.length,
      limit,
      offset: limit,
    };

    await paginatedDataCache.setCachedPaginatedData(
      filter,
      limit,
      offset,
      data1
    );

    const currentVersion = await paginatedDataCache.getCurrentVersion(
      paginatedDataCache._cacheKeyFactory(filter, limit, offset)
    );
    expect(currentVersion).to.equal(1, "Initial version should be 1");

    const cachedData = await paginatedDataCache.getCachedPaginatedData(
      filter,
      limit,
      offset
    );

    expect(cachedData).to.deep.equal(
      data1,
      "Cached paginated data should match expected data"
    );
    expect(cachedData.rows.length).to.equal(
      limit,
      "Number of rows should match limit"
    );

    const nextPage = await paginatedDataCache.getCachedPaginatedData(
      filter,
      limit,
      offset + limit
    );
    expect(nextPage).to.be.null;

    await paginatedDataCache.setCachedPaginatedData(
      filter,
      limit,
      offset + limit,
      data2
    );

    const nextVersion = await paginatedDataCache.getCurrentVersion(
      paginatedDataCache._cacheKeyFactory(filter, limit, offset + limit)
    );
    expect(nextVersion).to.equal(1, "Next page version should be 1");

    const nextCachedData = await paginatedDataCache.getCachedPaginatedData(
      filter,
      limit,
      offset + limit
    );
    expect(nextCachedData).to.deep.equal(
      data2,
      "Next page cached data should match expected data"
    );

    await paginatedDataCache.incrementCacheVersion(
      paginatedDataCache._cacheKeyFactory(filter, limit, offset)
    );

    const oldCachedData = await paginatedDataCache.getCachedPaginatedData(
      filter,
      limit,
      offset
    );
    expect(oldCachedData).to.be.null;

    const oldNextCachedData = await paginatedDataCache.getCachedPaginatedData(
      filter,
      limit,
      offset + limit
    );
    expect(oldNextCachedData).to.be.null;

    const newData = [
      { id: 1, name: "Andy" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
      { id: 4, name: "David" },
      { id: 5, name: "Eve" },
      { id: 6, name: "Frank" },
      { id: 7, name: "Grace" },
      { id: 8, name: "Hank" },
      { id: 9, name: "Ivy" },
      { id: 10, name: "Jack" },
    ];

    const newData1 = {
      rows: newData.slice(0, limit),
      total: newData.length,
      limit,
      offset,
    };

    await paginatedDataCache.setCachedPaginatedData(
      filter,
      limit,
      offset,
      newData1
    );
    const newCurrentVersion = await paginatedDataCache.getCurrentVersion(
      paginatedDataCache._cacheKeyFactory(filter, limit, offset)
    );
    expect(newCurrentVersion).to.equal(2, "New version should be 2");

    const newCachedData = await paginatedDataCache.getCachedPaginatedData(
      filter,
      limit,
      offset
    );
    expect(newCachedData).to.deep.equal(
      newData1,
      "New cached paginated data should match expected data"
    );
  });
});
