import bcrypt from "bcrypt";
import crypto from "crypto"

const saltRounds = 12; // More rounds for slower hashing

/**
 * Hashes a password using `bcrypt`.
 * @param password The plaintext password to hash.
 */
export async function hashPassword(
  password: string
): Promise<string> {
  const hashed = await bcrypt.hash(password, saltRounds);
  return hashed;
}

/**
 * Compares a plaintext password with a hashed password.
 * @param password The plaintext password.
 * @param passwordHash The hashed password.
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return await bcrypt.compare(password, passwordHash);
}

/**
 * Generates a random hexidecimal string.
 * @param size The number of bytes to generate (defaults to 32).
 */
export function generateToken(size = 32): string {
  return crypto.randomBytes(size).toString("hex");
}
