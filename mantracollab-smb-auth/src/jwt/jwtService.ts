import jwt, { JwtPayload } from "jsonwebtoken";

export function generateJWT(payload: object, secret: string): string {
  const token = jwt.sign(payload, secret, { expiresIn: "8h" });
  console.log("[MANTRA-JWT] Token generated for payload:", payload);
  return token;
}

export function verifyJWT(token: string, secret: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "object" && decoded !== null) {
      console.log("[MANTRA-JWT] Token verified successfully:", decoded);
      return decoded as JwtPayload;
    }
    console.warn(
      "[MANTRA-JWT] Token verification failed: Decoded value is not an object"
    );
    return null;
  } catch (error) {
    console.error("[MANTRA-JWT] Token verification error:", error);
    return null;
  }
}
