import { Resend } from "resend";
import { env } from "@/config/env";

const resend = new Resend(env.RESEND_API_KEY);

interface SendOtpEmailParams {
  to: string;
  name: string;
  otp: string;
}

export async function sendOtpEmail({ to, name, otp }: SendOtpEmailParams) {
  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: "তোমার Verification Code — 8 Prohor",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>স্বাগতম, ${name}!</h2>
        <p>তোমার account verify করতে নিচের কোডটি ব্যবহার করো:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f4f4f4; padding: 16px 24px; text-align: center; border-radius: 8px; margin: 16px 0;">
          ${otp}
        </div>
        <p style="color:#666; font-size:14px;">এই কোড 2 মিনিট পর expire হয়ে যাবে। যদি তুমি এই account না বানিয়ে থাকো, এই email ignore করো।</p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error("Failed to send OTP email");
  }

  return data;
}