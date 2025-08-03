import {
  randomBytes,
  pbkdf2Sync,
  createCipheriv,
  createDecipheriv,
} from "crypto";

const PBKDF2_ITERATIONS = 310_000; // adjust upward over time
const KEY_LEN = 32; // 256-bit AES key
const IV_LEN = 12; // standard for GCM
const SALT_LEN = 16; // at least 16 bytes

interface EncryptedPayload {
  iv: string; // hex
  salt: string; // hex
  ciphertext: string;
  tag: string; // auth tag (hex)
}

interface EncryptedPayload2FA {
  iv: string;
  saltUser: string;
  saltServer: string;
  ciphertext: string;
  tag: string;
}

/**
 * Encrypt a UTF-8 string using password-based AES-256-GCM
 */
export function encrypt(text: string, password: string): EncryptedPayload {
  const salt = randomBytes(SALT_LEN);
  const key = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LEN, "sha256");

  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    salt: salt.toString("hex"),
    ciphertext: ciphertext.toString("hex"),
    tag: tag.toString("hex"),
  };
}

/**
 * Decrypt payload produced by `encrypt`
 */
export function decrypt(payload: EncryptedPayload, password: string): string {
  const { iv, salt, ciphertext, tag } = payload;

  const key = pbkdf2Sync(
    Buffer.from(password),
    Buffer.from(salt, "hex"),
    PBKDF2_ITERATIONS,
    KEY_LEN,
    "sha256"
  );

  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "hex"));
  decipher.setAuthTag(Buffer.from(tag, "hex"));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "hex")),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
}

function deriveKey(password: string, salt: Buffer): Buffer {
  return pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LEN, "sha256");
}

export function encryptWithTwoFactors(
  plaintext: string,
  userPassword: string,
  serverSecret: string
): EncryptedPayload2FA {
  const saltUser = randomBytes(SALT_LEN);
  const saltServer = randomBytes(SALT_LEN);

  const userKey = deriveKey(userPassword, saltUser);
  const serverKey = deriveKey(serverSecret, saltServer);

  // Final AES key: XOR of both keys
  const finalKey = Buffer.alloc(KEY_LEN);
  for (let i = 0; i < KEY_LEN; i++) {
    finalKey[i] = userKey[i] ^ serverKey[i];
  }

  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv("aes-256-gcm", finalKey, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Cleanup sensitive buffers
  userKey.fill(0);
  serverKey.fill(0);
  finalKey.fill(0);

  return {
    iv: iv.toString("hex"),
    saltUser: saltUser.toString("hex"),
    saltServer: saltServer.toString("hex"),
    ciphertext: ciphertext.toString("hex"),
    tag: tag.toString("hex"),
  };
}

export function decryptWithTwoFactors(
  payload: EncryptedPayload2FA,
  userPassword: string,
  serverSecret: string
): string {
  const userKey = deriveKey(userPassword, Buffer.from(payload.saltUser, "hex"));
  const serverKey = deriveKey(
    serverSecret,
    Buffer.from(payload.saltServer, "hex")
  );

  const finalKey = Buffer.alloc(KEY_LEN);
  for (let i = 0; i < KEY_LEN; i++) {
    finalKey[i] = userKey[i] ^ serverKey[i];
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    finalKey,
    Buffer.from(payload.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "hex"));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "hex")),
    decipher.final(),
  ]);

  // Cleanup sensitive buffers
  userKey.fill(0);
  serverKey.fill(0);
  finalKey.fill(0);

  return plaintext.toString("utf8");
}
