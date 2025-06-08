import { createId } from "@paralleldrive/cuid2";

export function generateRandomId(): string {
  return createId();
}

export function generatePassword(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*(){}|+-";
  const all = chars + numbers + symbols;

  let retVal = "";
  retVal += chars.charAt(Math.floor(Math.random() * chars.length));
  retVal += numbers.charAt(Math.floor(Math.random() * numbers.length));
  retVal += symbols.charAt(Math.floor(Math.random() * symbols.length));

  for (let i = 0; i < length - 3; ++i) {
    retVal += all.charAt(Math.floor(Math.random() * all.length));
  }
  return retVal;
}

function escapeRegexCharacters(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function validatePasswordStrengthWithMessage(password: string): string {
  const escapedPassword = escapeRegexCharacters(password);

  if (escapedPassword.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!escapedPassword.match(/[a-z]/)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!escapedPassword.match(/[A-Z]/)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!escapedPassword.match(/[0-9]/)) {
    return "Password must contain at least one number";
  }
  if (!escapedPassword.match(/[^a-zA-Z0-9]/)) {
    return "Password must contain at least one special character";
  }
  return "";
}

const standardlize = (f1: string) =>
  f1.replace(new RegExp("_", "g"), "").toLowerCase();

type MaskRule = {
  keys: string[];
  pattern: RegExp;
  replacer: (...groups: string[]) => string;
};

const maskRules: MaskRule[] = [
  {
    keys: [
      "password",
      "Authorization",
      "access_token",
      "refresh_token",
      "signature",
    ],
    pattern: /^(.*)$/,
    replacer: () => "***masked***",
  },
  {
    keys: ["txid", "txnid"],
    pattern: /^(.{10})(.*)(.{36})$/,
    replacer: (_match, prefix, middle, suffix) =>
      `${prefix}${"*".repeat(middle.length)}${suffix}`,
  },
];

export const maskFn = (
  key: string,
  value: unknown,
  additionalMaskRules: MaskRule[] = []
): unknown => {
  // Only process string values
  if (typeof value !== "string") {
    return value;
  }

  const normalizedKey = standardlize(key);
  // Merge default rules with any additional ones
  const allRules = [...maskRules, ...additionalMaskRules];

  // Find a rule whose keys match the normalized key
  const rule = allRules.find(({ keys }) =>
    keys.some((k) => standardlize(k) === normalizedKey)
  );

  // No matching rule? Return the original value
  if (!rule) {
    return value;
  }

  // Apply pattern and replacer
  return value.replace(rule.pattern, rule.replacer);
};
