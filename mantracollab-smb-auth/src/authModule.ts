import passport from "passport";
import { generateOTP, storeOTP } from "./otp/otpService";
import { createPhoneStrategy } from "./strategies/phoneStrategy";
import { createEmailStrategy } from "./strategies/emailStrategy";
import { sendEmail, sendSMS } from "./helper/emailSmsSender";
import mongoose from "mongoose";

type AuthMethod = "sms" | "email";

interface AuthModuleConfig {
  jwtSecret: string;
  authMethod: AuthMethod;
  databaseConnection?: typeof mongoose | any; // Accept mongoose connection or similar
}

export class AuthModule {
  private jwtSecret: string;
  private authMethod: AuthMethod;
  private databaseConnection: typeof mongoose | any;

  constructor(config: AuthModuleConfig) {
    // Check for JWT secret
    if (!config.jwtSecret) {
      throw new Error("[MANTRA-AUTH] jwtSecret is required");
    }
    // Check for valid auth method
    if (!config.authMethod || !["sms", "email"].includes(config.authMethod)) {
      throw new Error("[MANTRA-AUTH] authMethod must be 'sms' or 'email'");
    }
    // Check for database connection
    if (
      !config.databaseConnection ||
      !config.databaseConnection.connection ||
      config.databaseConnection.connection.readyState !== 1
    ) {
      throw new Error("[MANTRA-AUTH] Active database connection is required");
    }

    this.jwtSecret = config.jwtSecret;
    this.authMethod = config.authMethod;
    this.databaseConnection = config.databaseConnection;

    console.log(
      `[MANTRA-AUTH] AuthModule initialized with method: ${this.authMethod}`
    );
  }

  async sendOTP(to: string): Promise<void> {
    const otp = generateOTP();
    await storeOTP(to, otp);
    console.log(
      `[MANTRA-AUTH] Sending OTP to ${to} using method: ${this.authMethod}`
    );
    if (this.authMethod === "sms") {
      await sendSMS(to, otp);
      console.log(`[MANTRA-AUTH] OTP sent via SMS to ${to}`);
    } else if (this.authMethod === "email") {
      await sendEmail(to, otp);
      console.log(`[MANTRA-AUTH] OTP sent via Email to ${to}`);
    } else {
      console.error("[MANTRA-AUTH] No sending method configured");
      throw new Error("No sending method configured");
    }
  }

  initStrategy(passportInstance: typeof passport) {
    if (this.authMethod === "sms") {
      passportInstance.use("phone-otp", createPhoneStrategy(this.jwtSecret));
      console.log("[MANTRA-AUTH] Phone OTP strategy initialized");
    } else {
      passportInstance.use("email-otp", createEmailStrategy(this.jwtSecret));
      console.log("[MANTRA-AUTH] Email OTP strategy initialized");
    }
  }
}
