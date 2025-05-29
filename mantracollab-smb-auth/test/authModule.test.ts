const mongoose = require("mongoose");
const { AuthModule } = require("../dist");

const MONGODB_URI = "";

async function main() {
  await mongoose.connect(MONGODB_URI);

  const auth = new AuthModule({
    jwtSecret: "testsecret",
    authMethod: "sms",
  });

  try {
    await auth.sendOTP("+918104392714");
    console.log("OTP sent successfully!");
  } catch (err) {
    console.error("Error sending OTP:", err);
  }

  await mongoose.disconnect();
}

main();
