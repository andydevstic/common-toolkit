export enum LOG_LEVEL {
  INFO = "info",
  ERROR = "error",
  DEBUG = "debug",
  FATAL = "fatal",
}

export enum STABLE_COIN {
  USDT = "usdt",
  USDV = "usdv",
  USDC = "usdc",
  BUSD = "busd",
}

export enum CRYPTO_TOKEN {
  USDT = "usdt",
  USDV = "usdv",
  USDC = "usdc",
  WVPC = "wvpc",
  VPC = "vpc",
  WOL = "wol",
  WETH = "weth",
  ETH = "eth",
  BNB = "bnb",
  WBNB = "wbnb",
  BUSD = "busd",
  BTC = "btc",
}

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export enum APP_ERROR {
  HTTP_REQ_TIMEOUT = "ECONNABORTED",
}

export enum SET_CACHE_POLICY {
  KEEP_TTL,
  WITH_TTL,
  IF_EXISTS,
  IF_NOT_EXISTS,
}

export enum APP_ENV {
  DEVELOPMENT = "development",
  STAGING = "staging",
  PRODUCTION = "production",
}

export enum FILTER_OPERATOR {
  NOT = "not",
  EQUAL = "eq",
  LIKE = "like",
  INS_LIKE = "ins_like", // case-insensitive
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  INS_STARTS_WITH = "ins_starts_with", // case-insensitive
  INS_ENDS_WITH = "ins_ends_with", // case-insensitive
  LESS_THAN = "lt",
  LESS_THAN_OR_EQUAL = "lte",
  GREATER_THAN = "gt",
  GREATER_THAN_OR_EQUAL = "gte",
  IN = "in",
  NOT_IN = "nin",
  OR = "or",
  NOR = "nor",
  AND = "and",
  IS = "is",
  NOT_EQUAL = "ne",
}
