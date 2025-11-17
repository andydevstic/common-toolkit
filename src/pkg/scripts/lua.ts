export const IncrByAndSetTTLIfNotExists = `
if redis.call("EXISTS", KEYS[1]) == 0 then
  redis.call("INCRBY", KEYS[1], ARGV[1])
  redis.call("EXPIRE", KEYS[1], ARGV[2])
end

return redis.call("GET", KEYS[1])
`;

export const IncrByAndEnsureTTLIsSet = `
local inc  = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])

redis.call("INCRBY", KEYS[1], inc)

if redis.call("TTL", KEYS[1]) == -1 then
  redis.call("EXPIRE", KEYS[1], ttl)
end

return tonumber(redis.call("GET", KEYS[1]))
`;
export const DecrByAndEnsureTTLIsSet = `
local inc  = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])

redis.call("DECRBY", KEYS[1], inc)

if redis.call("TTL", KEYS[1]) == -1 then
  redis.call("EXPIRE", KEYS[1], ttl)
end

return tonumber(redis.call("GET", KEYS[1]))
`;
export const IncrByFloatAndEnsureTTLIsSet = `
local inc  = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])

redis.call("INCRBYFLOAT", KEYS[1], inc)

if redis.call("TTL", KEYS[1]) == -1 then
  redis.call("EXPIRE", KEYS[1], ttl)
end

return tonumber(redis.call("GET", KEYS[1]))
`;

export const IncrByIfExists = `
if redis.call("EXISTS", KEYS[1]) == 1 then
  redis.call("INCRBY", KEYS[1], ARGV[1])
end

return redis.call("GET", KEYS[1])
`;

export const DecrbyAndSetTTLIfNotExists = `
if redis.call("EXISTS", KEYS[1]) == 0 then
  redis.call("DECRBY", KEYS[1], ARGV[1])
  redis.call("EXPIRE", KEYS[1], ARGV[2])
end

return redis.call("GET", KEYS[1])
`;

export const DecrbyIfExists = `
if redis.call("EXISTS", KEYS[1]) == 1 then
  redis.call("DECRBY", KEYS[1], ARGV[1])
end

return redis.call("GET", KEYS[1])
`;

export const IncrByFloatAndSetTTLIfNotExists = `
if redis.call("EXISTS", KEYS[1]) == 0 then
  redis.call("INCRBYFLOAT", KEYS[1], ARGV[1])
  redis.call("EXPIRE", KEYS[1], ARGV[2])
end

return redis.call("GET", KEYS[1])
`;

export const IncrByFloatIfExists = `
if redis.call("EXISTS", KEYS[1]) == 1 then
  redis.call("INCRBYFLOAT", KEYS[1], ARGV[1])
end

return redis.call("GET", KEYS[1])
`;

export const RefreshTTLIfBelowThreshold = `
-- KEYS[1] : key to inspect
-- ARGV[1] : threshold in seconds        (e.g. 10)
-- ARGV[2] : new TTL in seconds to set   (e.g. 60)

local ttl = redis.call("TTL", KEYS[1])

-- ttl == -2 → key doesn’t exist
-- ttl == -1 → key has no expiration
if ttl == -2 then
  return -2                           -- key absent
end

local threshold = tonumber(ARGV[1])
local newTTL    = tonumber(ARGV[2])

-- If TTL is missing (-1) or below threshold, refresh it
if ttl == -1 or ttl < threshold then
  redis.call("EXPIRE", KEYS[1], newTTL)
  return newTTL                       -- return the TTL we just set
end

return ttl                             -- unchanged TTL
`;
export const incrementAndCompareNumber = () => `
-- KEYS[1] = key
-- ARGV[1] = operator ("lt"|"lte"|"eq"|"gte"|"gt")
-- ARGV[2] = number to compare against

local k = KEYS[1]
local op = ARGV[1]
local rhs = tonumber(ARGV[2])
if rhs == nil then
  return redis.error_reply("ERR invalid compare number: " .. tostring(ARGV[2]))
end

local lhs = redis.call("INCR", k) -- will error if existing value is non-integer

local matched = false
if op == "lt"      then matched = (lhs <  rhs)
elseif op == "lte" then matched = (lhs <= rhs)
elseif op == "eq"  then matched = (lhs == rhs)
elseif op == "gte" then matched = (lhs >= rhs)
elseif op == "gt"  then matched = (lhs >  rhs)
else
  return redis.error_reply("ERR unknown operator: " .. tostring(op))
end

return matched and 1 or 0
`;
