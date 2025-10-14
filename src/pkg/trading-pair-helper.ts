import { CRYPTO_TOKEN, STABLE_COIN } from "../constants";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export type PairNameFormater = (data: string[]) => string;

const defaultFormatter: PairNameFormater = (data) => data.join("/");

export type NormalizePairNameOptions = {
  sortOrder?: "asc" | "desc";
  stableCoinRule?: "first" | "last" | "default";
  outputFormater?: PairNameFormater;
};

export const normalizePairName = (
  stableCoinList = STABLE_COIN,
  cryptoList = CRYPTO_TOKEN
) => {
  const stableTokensLower = Object.values(stableCoinList).map((i) =>
    i.toLowerCase()
  );
  const stableRe = new RegExp(`(${stableTokensLower.map(esc).join("|")})`, "i");

  // Keep both raw-lower (for includes) and escaped (for regex)
  const cryptoTokensLower = Object.values(cryptoList)
    .map((i) => i.toLowerCase())
    .sort((a, b) => b.length - a.length); // longest-first to avoid overlaps

  const cryptoTokensEscaped = cryptoTokensLower.map(esc);

  return (pairName: string, options?: NormalizePairNameOptions): string => {
    const {
      outputFormater = defaultFormatter,
      sortOrder = "asc",
      stableCoinRule = "last",
    } = options || {};

    // strip separators and normalize case once
    const normalized = pairName.replace(/[|/]/g, "").toLowerCase();
    const parts: string[] = [];

    // Stable-coin rule branch
    const hasStable = stableTokensLower.some((t) => normalized.includes(t));
    if (stableCoinRule !== "default" && hasStable) {
      const other = normalized.replace(stableRe, ""); // remove first stable
      const stable = normalized.replace(other, ""); // remainder is the stable
      const ordered =
        stableCoinRule === "first" ? [stable, other] : [other, stable];

      return outputFormater(ordered);
    }

    // General branch
    for (let i = 0; i < cryptoTokensLower.length; i++) {
      const raw = cryptoTokensLower[i];
      if (normalized.includes(raw)) {
        const pat = new RegExp(cryptoTokensEscaped[i], "i");
        const remainder = normalized.replace(pat, "");
        parts.push(raw, remainder);
        break; // stop at first/best match
      }
    }

    if (parts.length === 0) {
      throw new Error("pairname does not contain crypto from list");
    }

    const ordered =
      sortOrder === "asc"
        ? parts.sort((a, b) => a.localeCompare(b))
        : parts.sort((a, b) => b.localeCompare(a));

    return outputFormater(ordered);
  };
};
