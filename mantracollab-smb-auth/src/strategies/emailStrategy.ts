import { Strategy as CustomStrategy } from "passport-custom";
import { verifyOTP } from "../otp/otpService";
import { User } from "../models/user.model";

export function createEmailStrategy(jwtSecret: string) {
  return new CustomStrategy(async (req, done) => {
    const { email, otp } = req.body;
    console.log(
      `[MANTRA-EMAIL] Attempting OTP verification for email: ${email}`
    );

    const isValid = await verifyOTP(email, otp);
    if (!isValid) {
      console.warn(`[MANTRA-EMAIL] Invalid OTP for email: ${email}`);
      return done(null, { message: "Invalid OTP" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
      console.log(`[MANTRA-EMAIL] Created new user for email: ${email}`);
    } else {
      console.log(`[MANTRA-EMAIL] Found existing user for email: ${email}`);
    }

    console.log(`[MANTRA-EMAIL] Authentication successful for email: ${email}`);
    done(null, { email });
  });
}
