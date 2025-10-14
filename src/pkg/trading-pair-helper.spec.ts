// test/normalizePairName.spec.ts
import { describe, it } from "mocha";
import { expect } from "chai";
import { normalizePairName } from "./trading-pair-helper";
import { CRYPTO_TOKEN, STABLE_COIN } from "../constants";

describe("normalizePairName (functional factory)", () => {
  const normalize = normalizePairName(STABLE_COIN, CRYPTO_TOKEN);

  it("places stable coin last when stableCoinRule = 'last' (order-agnostic input)", () => {
    const a = normalize("USDTWVPC", {
      stableCoinRule: "last",
      sortOrder: "asc",
      separator: "/",
      outputFormater: undefined as any,
    });
    const b = normalize("WVPCUSDT", {
      stableCoinRule: "last",
      sortOrder: "asc",
      separator: "/",
      outputFormater: undefined as any,
    });
    expect(a).to.equal("wvpc/usdt");
    expect(b).to.equal("wvpc/usdt");
  });

  it("places stable coin first when stableCoinRule = 'first'", () => {
    const out = normalize("WVPCUSDC", {
      stableCoinRule: "first",
      sortOrder: "asc",
      separator: "/",
      outputFormater: undefined as any,
    });
    expect(out).to.equal("usdc/wvpc");
  });

  it("with stableCoinRule = 'default', uses general sort (no special placement)", () => {
    const outAsc = normalize("WVPCUSDT", {
      stableCoinRule: "default",
      sortOrder: "asc",
      separator: "/",
      outputFormater: undefined as any,
    });
    const outDesc = normalize("WVPCUSDT", {
      stableCoinRule: "default",
      sortOrder: "desc",
      separator: "/",
      outputFormater: undefined as any,
    });
    // asc: 'usdt' < 'wvpc' lexicographically
    expect(outAsc).to.equal("usdt/wvpc");
    // desc: 'wvpc' > 'usdt'
    expect(outDesc).to.equal("wvpc/usdt");
  });

  it("strips separators and is case-insensitive", () => {
    const a = normalize("ETH/USDT", {
      stableCoinRule: "last",
      sortOrder: "asc",
      separator: "/",
      outputFormater: undefined as any,
    });
    const b = normalize("ETH|USDT", {
      stableCoinRule: "last",
      sortOrder: "asc",
      separator: "/",
      outputFormater: undefined as any,
    });
    const c = normalize("wVpCusdT", {
      stableCoinRule: "last",
      sortOrder: "asc",
      separator: "/",
      outputFormater: undefined as any,
    });
    expect(a).to.equal("eth/usdt");
    expect(b).to.equal("eth/usdt");
    expect(c).to.equal("wvpc/usdt");
  });

  it("handles overlapping tokens by preferring longest match (e.g., WETH vs ETH)", () => {
    // No stable coin here, so general path + sorting
    const outAsc = normalize("WETHETH", {
      stableCoinRule: "default",
      sortOrder: "asc",
      separator: "/",
      outputFormater: undefined as any,
    });
    const outDesc = normalize("WETHETH", {
      stableCoinRule: "default",
      sortOrder: "desc",
      separator: "/",
      outputFormater: undefined as any,
    });
    // After longest-first split → parts = ['weth','eth']; then sorted:
    expect(outAsc).to.equal("eth/weth");
    expect(outDesc).to.equal("weth/eth");
  });

  it("sorts non-stable pairs lexicographically based on sortOrder", () => {
    const outAsc = normalize("BTCETH", {
      stableCoinRule: "default",
      sortOrder: "asc",
      separator: "/",
      outputFormater: undefined as any,
    });
    const outDesc = normalize("BTCETH", {
      stableCoinRule: "default",
      sortOrder: "desc",
      separator: "/",
      outputFormater: undefined as any,
    });
    expect(outAsc).to.equal("btc/eth");
    expect(outDesc).to.equal("eth/btc");
  });

  it("passes the separator into the output formatter", () => {
    const out = normalize("WVPCUSDT", {
      stableCoinRule: "last",
      sortOrder: "asc",
      separator: "-",
      outputFormater: (parts, sep) => parts.join(sep),
    });
    expect(out).to.equal("wvpc-usdt");
  });

  it("supports custom formatter (e.g., uppercase concatenation)", () => {
    const out = normalize("WVPCUSDT", {
      stableCoinRule: "last",
      sortOrder: "asc",
      separator: "/",
      outputFormater: (parts) => parts.map((p) => p.toUpperCase()).join(""),
    });
    expect(out).to.equal("WVPCUSDT");
  });

  it("throws when no known tokens found", () => {
    expect(() =>
      normalize("FOOBAR", {
        stableCoinRule: "default",
        sortOrder: "asc",
        separator: "/",
        outputFormater: undefined as any,
      })
    ).to.throw(/does not contain crypto from list/i);
  });
});
