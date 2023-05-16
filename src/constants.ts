export enum LOG_LEVEL {
  INFO = "info",
  ERROR = "error",
  DEBUG = "debug",
  FATAL = "fatal",
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
  EQUAL = "eq",
  LIKE = "like",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
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
