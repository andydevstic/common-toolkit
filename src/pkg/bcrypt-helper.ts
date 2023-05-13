import * as bcrypt from "bcrypt";

export function hash(data: string, salt?: string | number): Promise<string> {
  return bcrypt.hash(data, salt || 12);
}

export function compare(raw: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(raw, hashed);
}
