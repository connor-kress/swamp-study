import { EmailService } from "./EmailService";
import sgMail from "@sendgrid/mail";
import config from "../../config";

export class SendGridEmailService implements EmailService {
  constructor() {
    if (!config.emailConfig.sendgridApiKey) {
      throw new Error("SendGrid API Key is missing in constructor.");
    }
    sgMail.setApiKey(config.emailConfig.sendgridApiKey);
  }

  async sendVerificationCode(
    email: string,
    name: string,
    code: string,
  ): Promise<void> {
    const msg = {
      to: email,
      from: config.emailConfig.fromAddress,
      subject: "Your Verification Code",
      text: `Hi ${name},\n\nYour verification code is: ${code}\n\nEnter this code in the app to verify your email address.\n\nIf you didn't request this, please ignore this email.\n\nThanks,\nThe SwampStudy Team\n${config.baseUrl}`, // Add base URL link
      html: `
        <p>Hi ${name},</p>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>Enter this code in the app to verify your email address.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p>Thanks,<br>The SwampStudy Team</p>
        <p><a href="${config.baseUrl}">${config.baseUrl}</a></p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Verification code sent to ${email} via SendGrid`);
    } catch (error: any) {
      console.error(
        `Error sending verification code via SendGrid to ${email}:`,
      );
      if (error.response) {
        console.error(error.response.body);
      } else {
        console.error(error);
      }
      throw new Error("Failed to send verification code via SendGrid");
    }
  }
}
