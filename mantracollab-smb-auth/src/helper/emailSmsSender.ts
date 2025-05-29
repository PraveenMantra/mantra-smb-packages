import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  region: "ca-central-1",
  // credentials: {
  //   accessKeyId: "",
  //   secretAccessKey: "",
  // },
}); // Change region as needed

export async function sendSMS(phone: string, otp: string): Promise<void> {
  const message = `Your verification code is: ${otp}`;
  const params = {
    Message: message,
    PhoneNumber: phone,
  };
  try {
    console.log(
      `[MANTRA-SNS] Sending SMS to ${phone} with message: ${message}`
    );
    await snsClient.send(new PublishCommand(params));
    console.log(`[MANTRA-SNS] SMS sent to ${phone}`);
  } catch (error) {
    console.error(`[MANTRA-SNS] Failed to send SMS to ${phone}:`, error);
    throw error;
  }
}

export async function sendEmail(
  email: string,
  message: string,
  subject = "Your OTP Code"
): Promise<void> {
  const params = {
    Message: message,
    Subject: subject,
    TopicArn: process.env.SNS_EMAIL_TOPIC_ARN, // You must create an SNS topic for email and subscribe your email address
  };
  try {
    console.log(
      `[MANTRA-SNS] Sending Email to topic ${params.TopicArn} with subject: ${subject} and message: ${message}`
    );
    await snsClient.send(new PublishCommand(params));
    console.log(`[SNS] Email sent to topic ${params.TopicArn}`);
  } catch (error) {
    console.error(
      `[MANTRA-SNS] Failed to send Email to topic ${params.TopicArn}:`,
      error
    );
    throw error;
  }
}
