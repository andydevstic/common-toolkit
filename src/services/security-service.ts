import {
  CRUDService,
  CacheService,
  LockResult,
  OperationResult,
} from "../interfaces";

export class SecurityService {
  constructor(
    protected cacheService: CacheService,
    protected userService: CRUDService
  ) {}

  public static LIMIT_TO_LOCK_USER = 5;

  public static genLockUserCacheKey(userId: number): string {
    return `user:${userId}:lock`;
  }

  public async addFailureCount(
    userId: number,
    cacheKey?: string
  ): Promise<number> {
    const finalCacheKey =
      cacheKey || SecurityService.genLockUserCacheKey(userId);

    await this.cacheService.incrBy(finalCacheKey);

    return this.cacheService.get(finalCacheKey);
  }

  public async clearFailureCount(userId: number, cacheKey?: string) {
    const finalCacheKey =
      cacheKey || SecurityService.genLockUserCacheKey(userId);

    await this.cacheService.del(finalCacheKey);
  }

  async shouldLockUser(
    userId: number,
    cacheKey?: string
  ): Promise<OperationResult<LockResult>> {
    try {
      const incrementedAttemptsCount = await this.addFailureCount(
        userId,
        cacheKey
      );

      // lock user
      if (incrementedAttemptsCount >= SecurityService.LIMIT_TO_LOCK_USER) {
        await this.clearFailureCount(userId);

        return {
          success: true,
          data: {
            isLocked: true,
            attemptsLeft: 0,
          },
        };
      }

      return {
        success: true,
        data: {
          isLocked: false,
          attemptsLeft: Math.max(
            0,
            SecurityService.LIMIT_TO_LOCK_USER - incrementedAttemptsCount
          ),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        metadata: error.stack,
      };
    }
  }
}
