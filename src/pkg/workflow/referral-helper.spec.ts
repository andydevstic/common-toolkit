import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

const expect = chai.expect;

import { isReferrerValid, REFERRAL_ERROR_CODE } from "./referral-helper";

type UserReferralInfo = {
  id: string | number;
  code: string;
  referrerCode: string;
};

// Mock user database
const mockUsers: UserReferralInfo[] = [
  { id: 1, code: "USER001", referrerCode: "" },
  { id: 2, code: "USER002", referrerCode: "USER001" },
  { id: 3, code: "USER003", referrerCode: "USER002" },
  { id: 4, code: "USER004", referrerCode: "USER003" },
  { id: 5, code: "USER005", referrerCode: "USER004" },
  // Circular referral chain for testing
  { id: 6, code: "CIRCULAR1", referrerCode: "CIRCULAR3" },
  { id: 7, code: "CIRCULAR2", referrerCode: "CIRCULAR1" },
  { id: 8, code: "CIRCULAR3", referrerCode: "CIRCULAR2" },
];

// Mock findUserByCode function
const mockFindUserByCode = async (
  code: string
): Promise<UserReferralInfo | null> => {
  const user = mockUsers.find((u) => u.code === code);
  return user || null;
};

describe("isReferrerValid", () => {
  describe("validation errors", () => {
    it("should return invalid when userCode is empty", async () => {
      const result = await isReferrerValid("", "USER001", mockFindUserByCode);

      expect(result.isValid).to.be.false;
      expect(result.reason).to.equal(REFERRAL_ERROR_CODE.MISSING_USER_CODE);
    });

    it("should return invalid when referrerCode is empty", async () => {
      const result = await isReferrerValid("USER001", "", mockFindUserByCode);

      expect(result.isValid).to.be.false;
      expect(result.reason).to.equal(REFERRAL_ERROR_CODE.MISSING_REFERRER_CODE);
    });

    it("should return invalid when maxDepth is 0", async () => {
      // BUG: maxDepth of 0 should be invalid, but the check `options?.maxDepth && options?.maxDepth < 1`
      // treats 0 as falsy and skips the validation entirely
      const result = await isReferrerValid(
        "NEWUSER",
        "USER001",
        mockFindUserByCode,
        { maxDepth: 0 }
      );

      expect(result.isValid).to.be.false;
      expect(result.reason).to.equal(REFERRAL_ERROR_CODE.INVALID_MAX_LEVEL);
    });

    it("should return invalid when maxDepth is negative", async () => {
      const result = await isReferrerValid(
        "NEWUSER",
        "USER001",
        mockFindUserByCode,
        { maxDepth: -5 }
      );

      expect(result.isValid).to.be.false;
      expect(result.reason).to.equal(REFERRAL_ERROR_CODE.INVALID_MAX_LEVEL);
    });

    it("should return invalid when userCode is the same as referrerCode", async () => {
      const result = await isReferrerValid(
        "USER001",
        "USER001",
        mockFindUserByCode
      );

      expect(result.isValid).to.be.false;
      expect(result.reason).to.equal(
        REFERRAL_ERROR_CODE.USER_CODE_IS_SAME_AS_REFERRER_CODE
      );
    });

    it("should return invalid when referrer is not found", async () => {
      const result = await isReferrerValid(
        "NEWUSER",
        "NONEXISTENT",
        mockFindUserByCode
      );

      expect(result.isValid).to.be.false;
      expect(result.reason).to.equal(REFERRAL_ERROR_CODE.REFERRER_NOT_FOUND);
    });
  });

  describe("valid referrals", () => {
    it("should return valid when referrer exists and has no referrer chain", async () => {
      const result = await isReferrerValid(
        "NEWUSER",
        "USER001",
        mockFindUserByCode
      );

      expect(result.isValid).to.be.true;
      expect(result.reason).to.equal("");
    });

    it("should return valid when referrer chain is valid", async () => {
      const result = await isReferrerValid(
        "NEWUSER",
        "USER003",
        mockFindUserByCode
      );

      expect(result.isValid).to.be.true;
      expect(result.reason).to.equal("");
    });

    it("should return valid when referrer chain is within maxDepth", async () => {
      const result = await isReferrerValid(
        "NEWUSER",
        "USER003",
        mockFindUserByCode,
        { maxDepth: 5 }
      );

      expect(result.isValid).to.be.true;
      expect(result.reason).to.equal("");
    });
  });

  describe("circular referral detection", () => {
    it("should return invalid when circular referral is detected", async () => {
      // Create a scenario where the new user's code appears in the referral chain
      const circularMockUsers: UserReferralInfo[] = [
        { id: 1, code: "A", referrerCode: "C" },
        { id: 2, code: "B", referrerCode: "A" },
        { id: 3, code: "C", referrerCode: "B" },
      ];

      const circularMockFindUserByCode = async (
        code: string
      ): Promise<UserReferralInfo | null> => {
        const user = circularMockUsers.find((u) => u.code === code);
        return user || null;
      };

      // User "A" trying to use "C" as referrer creates a circular chain
      // because C -> B -> A -> C (circular)
      const result = await isReferrerValid("A", "C", circularMockFindUserByCode);

      expect(result.isValid).to.be.false;
      expect(result.reason).to.equal(
        REFERRAL_ERROR_CODE.CIRCULAR_REFERRAL_FOUND
      );
    });
  });

  describe("max depth validation", () => {
    it("should return invalid when referral chain exceeds maxDepth", async () => {
      // USER005 -> USER004 -> USER003 -> USER002 -> USER001
      // If we set maxDepth to 2, it should fail at level 2
      const result = await isReferrerValid(
        "NEWUSER",
        "USER005",
        mockFindUserByCode,
        { maxDepth: 2 }
      );

      expect(result.isValid).to.be.false;
      expect(result.reason).to.equal(REFERRAL_ERROR_CODE.MAX_DEPTH_REACHED);
    });

    it("should return valid when referral chain equals maxDepth", async () => {
      // USER003 -> USER002 -> USER001 (chain of 2)
      const result = await isReferrerValid(
        "NEWUSER",
        "USER003",
        mockFindUserByCode,
        { maxDepth: 3 }
      );

      expect(result.isValid).to.be.true;
    });

    it("should return valid when maxDepth is 1 and referrer has no upper referrer", async () => {
      const result = await isReferrerValid(
        "NEWUSER",
        "USER001",
        mockFindUserByCode,
        { maxDepth: 1 }
      );

      expect(result.isValid).to.be.true;
    });
  });

  describe("edge cases", () => {
    it("should handle async findUserByCode correctly", async () => {
      const delayedFindUserByCode = async (
        code: string
      ): Promise<UserReferralInfo | null> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const user = mockUsers.find((u) => u.code === code);
            resolve(user || null);
          }, 10);
        });
      };

      const result = await isReferrerValid(
        "NEWUSER",
        "USER002",
        delayedFindUserByCode
      );

      expect(result.isValid).to.be.true;
    });

    it("should handle user with numeric id", async () => {
      const result = await isReferrerValid(
        "NEWUSER",
        "USER001",
        mockFindUserByCode
      );

      expect(result.isValid).to.be.true;
    });

    it("should handle user with string id", async () => {
      const stringIdUsers: UserReferralInfo[] = [
        { id: "uuid-123", code: "STRUSER1", referrerCode: "" },
      ];

      const stringIdFindUserByCode = async (
        code: string
      ): Promise<UserReferralInfo | null> => {
        const user = stringIdUsers.find((u) => u.code === code);
        return user || null;
      };

      const result = await isReferrerValid(
        "NEWUSER",
        "STRUSER1",
        stringIdFindUserByCode
      );

      expect(result.isValid).to.be.true;
    });
  });
});
