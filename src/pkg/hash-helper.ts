import * as crypto from "crypto";

import jsonS = require("fast-json-stable-stringify");

export const generateHashFromJSON = (data: Record<string, any>): string => {
  if (!data || typeof data !== "object") {
    throw new Error("Input must be a non-null object");
  }

  const jsonString = jsonS(data);
  return crypto.createHash("sha256").update(jsonString).digest("hex");
};
