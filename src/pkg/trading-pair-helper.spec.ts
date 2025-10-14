// test/normalizePairName.spec.ts
import { describe, it } from "mocha";
import { expect } from "chai";
import {
  normalizePairName,
  arePairNamesSameDirection,
} from "./trading-pair-helper";
import { CRYPTO_TOKEN, STABLE_COIN } from "../constants";

describe("normalizePairName (factory)", () => {
  const normalize = normalizePairName(STABLE_COIN, CRYPTO_TOKEN);

  it("places stable coin last when stableCoinRule='last' (order-agnostic input)", () => {
    const a = normalize("USDTWVPC", {
      stableCoinRule: "last",
      sortOrder: "asc",
      outputFormater: undefined as any,
    });
    const b = normalize("WVPCUSDT", {
      stableCoinRule: "last",
      sortOrder: "asc",
      outputFormater: undefined as any,
    });
    expect(a).to.equal("wvpc/usdt");
    expect(b).to.equal("wvpc/usdt");
  });

  it("places stable coin first when stableCoinRule='first'", () => {
    const out = normalize("WVPCUSDC", {
      stableCoinRule: "first",
      sortOrder: "asc",
      outputFormater: undefined as any,
    });
    expect(out).to.equal("usdc/wvpc");
  });

  it("with stableCoinRule='default', uses general sort (no special placement)", () => {
    const outAsc = normalize("WVPCUSDT", {
      stableCoinRule: "default",
      sortOrder: "asc",
      outputFormater: undefined as any,
    });
    const outDesc = normalize("WVPCUSDT", {
      stableCoinRule: "default",
      sortOrder: "desc",
      outputFormater: undefined as any,
    });
    // asc: 'usdt' < 'wvpc'
    expect(outAsc).to.equal("usdt/wvpc");
    // desc: 'wvpc' > 'usdt'
    expect(outDesc).to.equal("wvpc/usdt");
  });

  it("supports no-separator inputs", () => {
    const a = normalize("BTCUSDT", {
      stableCoinRule: "last",
      sortOrder: "asc",
      outputFormater: undefined as any,
    });
    const b = normalize("USDTBTC", {
      stableCoinRule: "last",
      sortOrder: "asc",
      outputFormater: undefined as any,
    });
    expect(a).to.equal("btc/usdt");
    expect(b).to.equal("btc/usdt");
  });

  it("strips common separators and is case-insensitive", () => {
    const a = normalize("ETH/USDT", {
      stableCoinRule: "last",
      sortOrder: "asc",
      outputFormater: undefined as any,
    });
    const b = normalize("ETH-USDT", {
      stableCoinRule: "last",
      sortOrder: "asc",
      outputFormater: undefined as any,
    });
    const c = normalize("wVpC:usdT", {
      stableCoinRule: "last",
      sortOrder: "asc",
      outputFormater: undefined as any,
    });
    expect(a).to.equal("eth/usdt");
    expect(b).to.equal("eth/usdt");
    expect(c).to.equal("wvpc/usdt");
  });

  it("handles overlapping tokens by preferring longest match (e.g., WETH vs ETH)", () => {
    const outAsc = normalize("WETHETH", {
      stableCoinRule: "default",
      sortOrder: "asc",
      outputFormater: undefined as any,
    });
    const outDesc = normalize("WETHETH", {
      stableCoinRule: "default",
      sortOrder: "desc",
      outputFormater: undefined as any,
    });
    expect(outAsc).to.equal("eth/weth"); // lexicographic asc
    expect(outDesc).to.equal("weth/eth"); // lexicographic desc
  });

  it("sorts non-stable pairs lexicographically per sortOrder", () => {
    const outAsc = normalize("BTCETH", {
      stableCoinRule: "default",
      sortOrder: "asc",
      outputFormater: undefined as any,
    });
    const outDesc = normalize("BTCETH", {
      stableCoinRule: "default",
      sortOrder: "desc",
      outputFormater: undefined as any,
    });
    expect(outAsc).to.equal("btc/eth");
    expect(outDesc).to.equal("eth/btc");
  });

  it("passes parts to custom formatter (separator change)", () => {
    const out = normalize("WVPCUSDT", {
      stableCoinRule: "last",
      sortOrder: "asc",
      outputFormater: (parts) => parts.join("-"),
    });
    expect(out).to.equal("wvpc-usdt");
  });

  it("supports custom formatter (uppercase concat)", () => {
    const out = normalize("WVPCUSDT", {
      stableCoinRule: "last",
      sortOrder: "asc",
      outputFormater: (parts) => parts.map((p) => p.toUpperCase()).join(""),
    });
    expect(out).to.equal("WVPCUSDT");
  });

  it("throws when no known tokens found", () => {
    expect(() =>
      normalize("FOOBAR", {
        stableCoinRule: "default",
        sortOrder: "asc",
        outputFormater: undefined as any,
      })
    ).to.throw(/pairname does not contain crypto from list/i);
  });

  it("throws when other token is unknown (e.g., BTC/FOO)", () => {
    expect(() =>
      normalize("BTC/FOO", {
        stableCoinRule: "default",
        sortOrder: "asc",
        outputFormater: undefined as any,
      })
    ).to.throw(/unknown quote token/i);
  });

  it("two stable coins with stableCoinRule='default' throws (no crypto path)", () => {
    expect(() =>
      normalize("CUSDUSDK", {
        stableCoinRule: "default",
        sortOrder: "asc",
        outputFormater: undefined as any,
      })
    ).to.throw(/pairname does not contain crypto from list/i);
  });
});

describe("arePairNamesSameDirection", () => {
  it("treats different separators as same direction", () => {
    expect(arePairNamesSameDirection("btc/usdt", "btc_usdt")).to.equal(true);
    expect(arePairNamesSameDirection("WVPC:USDT", "wvpc-usdt")).to.equal(true);
  });

  it("detects reversed direction", () => {
    expect(arePairNamesSameDirection("btc/usdt", "usdt/btc")).to.equal(false);
  });

  it("is case-insensitive", () => {
    expect(arePairNamesSameDirection("WvPc/UsDt", "wvpc/usdt")).to.equal(true);
  });

  it("does not treat no-separator as the same (by design)", () => {
    expect(arePairNamesSameDirection("eth/usdt", "ethusdt")).to.equal(false);
  });
});
