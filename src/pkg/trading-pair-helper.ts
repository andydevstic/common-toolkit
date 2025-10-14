import { CRYPTO_TOKEN, STABLE_COIN } from "../constants";

const pairNameSanitizer = (pairName: string) =>
  pairName
    .trim()
    .toLowerCase()
    .replace(/[ \t:_\-\/]+/g, "/");

const regexpEscaper = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export type PairNameFormater = (data: string[]) => string;

const defaultFormatter: PairNameFormater = (data) => data.join("/");

export type NormalizePairNameOptions = {
  sortOrder?: "asc" | "desc";
  stableCoinRule?: "first" | "last" | "default";
  outputFormater?: PairNameFormater;
};

export function arePairNamesSameDirection(
  pair1: string,
  pair2: string
): boolean {
  return pairNameSanitizer(pair1) === pairNameSanitizer(pair2);
}

export const normalizePairName = (
  stableCoinList = STABLE_COIN,
  cryptoList = CRYPTO_TOKEN
) => {
  const stableTokensLower = Object.values(stableCoinList)
    .map((s) => s.toLowerCase())
    .sort((a, b) => b.length - a.length);
  const cryptoTokensLower = Object.values(cryptoList)
    .map((s) => s.toLowerCase())
    .sort((a, b) => b.length - a.length);
  const TOKENS_SET = new Set([...stableTokensLower, ...cryptoTokensLower]);

  const stableRe = new RegExp(
    `(${stableTokensLower.map(regexpEscaper).join("|")})`,
    "i"
  );

  return (pairName: string, options?: NormalizePairNameOptions): string => {
    const {
      outputFormater = defaultFormatter,
      sortOrder = "asc",
      stableCoinRule = "last",
    } = options || {};

    const sanitized = pairNameSanitizer(pairName); // e.g. "btc/usdt"
    const compact = sanitized.replace(/\//g, ""); // e.g. "btcusdt"

    // ---- Stable-coin rule branch ----
    const m = compact.match(stableRe);
    if (stableCoinRule !== "default" && m) {
      const stable = m[0].toLowerCase();
      const other = compact.replace(new RegExp(regexpEscaper(stable), "i"), "");
      if (!TOKENS_SET.has(other)) throw new Error("unknown quote token");
      const ordered =
        stableCoinRule === "first" ? [stable, other] : [other, stable];
      return outputFormater(ordered);
    }

    // ---- General branch ----
    const hit = cryptoTokensLower.find(
      (t) => compact.startsWith(t) || compact.endsWith(t)
    );
    if (!hit) throw new Error("pairname does not contain crypto from list");
    const other = compact.startsWith(hit)
      ? compact.slice(hit.length)
      : compact.slice(0, compact.length - hit.length);
    if (!TOKENS_SET.has(other)) throw new Error("unknown quote token");

    const parts = [hit, other];
    const ordered =
      sortOrder === "asc"
        ? parts.sort((a, b) => a.localeCompare(b))
        : parts.sort((a, b) => b.localeCompare(a));
    return outputFormater(ordered);
  };
};
