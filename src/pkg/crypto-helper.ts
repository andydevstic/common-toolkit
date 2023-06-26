import { createHash } from "crypto";

export const sha512Encrypt = (data: string, privateKey: string) => {
  const sha512Hasher = createHash("sha512");
  const finalData = `${data}_${privateKey}`;

  return sha512Hasher.update(finalData).digest("hex");
};

export const sha512Verify = (
  hashedToVerify: string,
  data: string,
  privateKey: string
): boolean => {
  const hashed = sha512Encrypt(data, privateKey);

  return hashedToVerify === hashed;
};
