import * as crypto from "crypto";

export const REFERRAL_ERROR_CODE = {
  USER_CODE_IS_SAME_AS_REFERRER_CODE:
    "USER_CODE_IS_SAME_AS_REFERRER_CODE".toLowerCase(),
  MAX_DEPTH_REACHED: "MAX_DEPTH_REACHED".toLowerCase(),
  REFERRER_NOT_FOUND: "REFERRER_NOT_FOUND".toLowerCase(),
  CIRCULAR_REFERRAL_FOUND: "CIRCULAR_REFERRAL_FOUND".toLowerCase(),
  MISSING_USER_CODE: "MISSING_USER_CODE".toLowerCase(),
  MISSING_REFERRER_CODE: "MISSING_REFERRER_CODE".toLowerCase(),
  INVALID_MAX_LEVEL: "INVALID_MAX_LEVEL".toLowerCase(),
};

export function generateReferralCode(): string {
  const random = crypto.randomBytes(7).toString("hex");

  return random.toUpperCase();
}

type UserReferralInfo = {
  id: string | number;
  code: string;
  referrerCode: string;
};

/**
 * Checks if a user's referrer code is valid. Prevents circular referral
 * @param userCode
 * @param referrerCode
 * @param findUserByCode
 * @returns boolean
 */
export async function isReferrerValid(
  userCode: string,
  referrerCode: string,
  findUserByCode: (code: string) => Promise<UserReferralInfo | null>,
  options?: {
    maxDepth: number;
  }
): Promise<{ isValid: boolean; reason?: string }> {
  if (!userCode) {
    return {
      isValid: false,
      reason: REFERRAL_ERROR_CODE.MISSING_USER_CODE,
    };
  }

  if (!referrerCode) {
    return {
      isValid: false,
      reason: REFERRAL_ERROR_CODE.MISSING_REFERRER_CODE,
    };
  }

  if (options?.maxDepth && options?.maxDepth < 1) {
    return {
      isValid: false,
      reason: REFERRAL_ERROR_CODE.INVALID_MAX_LEVEL,
    };
  }

  if (userCode === referrerCode) {
    return {
      isValid: false,
      reason: REFERRAL_ERROR_CODE.USER_CODE_IS_SAME_AS_REFERRER_CODE,
    };
  }

  const seenMap = new Set<string>();
  seenMap.add(userCode);

  let foundUser = await findUserByCode(referrerCode);

  if (!foundUser) {
    return {
      isValid: false,
      reason: REFERRAL_ERROR_CODE.REFERRER_NOT_FOUND,
    };
  }

  let currentLevel = 0;

  while (foundUser?.referrerCode) {
    currentLevel++;

    if (seenMap.has(foundUser.code)) {
      return {
        isValid: false,
        reason: REFERRAL_ERROR_CODE.CIRCULAR_REFERRAL_FOUND,
      };
    }

    if (options?.maxDepth && currentLevel) {
      return {
        isValid: false,
        reason: REFERRAL_ERROR_CODE.MAX_DEPTH_REACHED,
      };
    }

    seenMap.add(foundUser.code);

    foundUser = await findUserByCode(foundUser.referrerCode);
  }

  return {
    isValid: true,
    reason: "",
  };
}
