import { Strategy as CustomStrategy } from "passport-custom";
import { verifyOTP } from "../otp/otpService";
import { User } from "../models/user.model";
import { generateJWT } from "../jwt/jwtService";

export function createPhoneStrategy(jwtSecret: string) {
  return new CustomStrategy(async (req, done) => {
    const { phone, otp } = req.body;
    console.log(
      `[MANTRA-PHONE] Attempting OTP verification for phone: ${phone}`
    );

    const isValid = await verifyOTP(phone, otp);
    if (!isValid) {
      console.warn(`[MANTRA-PHONE] Invalid OTP for phone: ${phone}`);
      return done(null, { message: "Invalid OTP" });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone });
      console.log(`[MANTRA-PHONE] Created new user for phone: ${phone}`);
    } else {
      console.log(`[MANTRA-PHONE] Found existing user for phone: ${phone}`);
    }

    // Generate JWT token after successful verification
    const token = generateJWT({ phone: user.phone, id: user._id }, jwtSecret);

    console.log(`[MANTRA-PHONE] Authentication successful for phone: ${phone}`);
    done(null, { phone: user.phone, token });
  });
}
