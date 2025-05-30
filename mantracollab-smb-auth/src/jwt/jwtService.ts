import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model";

/**
 * Generates a JWT token with an 8h expiration.
 */
export function generateJWT(payload: object, secret: string): string {
  const token = jwt.sign(payload, secret, { expiresIn: "8h" });
  console.log("[MANTRA-JWT] Token generated for payload:", payload);
  return token;
}

/**
 * Verifies a JWT token, checks expiration, ensures user._id exists,
 * and fetches the user object from the database if id is present.
 * Returns the user object if valid, otherwise null.
 */
export async function verifyJWT(
  token: string,
  secret: string
): Promise<any | null> {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Check if user._id exists in payload
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      console.warn(
        "[MANTRA-JWT] Token verification failed: Missing user._id (id) in payload"
      );
      return null;
    }

    // Check expiration (exp is in seconds)
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.warn("[MANTRA-JWT] Token verification failed: Token expired");
      return null;
    }

    // Fetch user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      console.warn("[MANTRA-JWT] No user found for id:", decoded.id);
      return null;
    }

    console.log(
      "[MANTRA-JWT] Token verified and user fetched successfully:",
      user
    );
    return user;
  } catch (error) {
    console.error("[MANTRA-JWT] Token verification error:", error);
    return null;
  }
}
