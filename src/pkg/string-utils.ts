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
const masks = [
  {
    match: (value: string) =>
      [
        "password",
        "Authorization",
        "access_token",
        "refresh_token",
        "signature",
      ]
        .map((item) => standardlize(item))
        .includes(standardlize(value)),
    pattern: /^(.*)$/,
    replacer: (_, _s1: string) => "***masked***",
  },
  {
    match: (value: string) =>
      ["txid", "txnid"]
        .map((item) => standardlize(item))
        .includes(standardlize(value)),
    pattern: /^(.{10})(.*)(.{36})$/,
    replacer: (_, s1: string, s2: string, s3: string) =>
      `${s1}${"*".repeat(s2.length)}${s3}`,
  },
];

export const maskFn = (key: string, value: string) => {
  if (typeof value === "object") return value;
  const foundMask = masks.find((m) => m.match(key));
  if (!foundMask) return value;
  const { pattern, replacer } = foundMask;
  return value?.replace?.(pattern, replacer) || "";
};
