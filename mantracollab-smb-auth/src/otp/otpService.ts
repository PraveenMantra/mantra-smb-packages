import mongoose from "mongoose";

// Define OTP schema and model
const otpSchema = new mongoose.Schema({
  to: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // 5 minutes TTL
});

const OTPModel = mongoose.models.OTP || mongoose.model("OTP", otpSchema);

export function generateOTP(): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`[MANTRA-OTP] Generated OTP: ${otp}`);
  return otp;
}

export async function storeOTP(to: string, otp: string) {
  try {
    await OTPModel.findOneAndUpdate(
      { to },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );
    console.log(`[MANTRA-OTP] Stored OTP for ${to}`);
  } catch (error) {
    console.error(`[MANTRA-OTP] Error storing OTP for ${to}:`, error);
    throw error;
  }
}

export async function verifyOTP(to: string, otp: string): Promise<boolean> {
  try {
    const record = await OTPModel.findOne({ to });
    if (!record) {
      console.warn(`[MANTRA-OTP] No OTP record found for ${to}`);
      return false;
    }
    const valid = record.otp === otp;
    if (valid) {
      await OTPModel.deleteOne({ to });
      console.log(`[MANTRA-OTP] OTP verified and deleted for ${to}`);
    } else {
      console.warn(`[MANTRA-OTP] Invalid OTP for ${to}`);
    }
    return valid;
  } catch (error) {
    console.error(`[MANTRA-OTP] Error verifying OTP for ${to}:`, error);
    return false;
  }
}
