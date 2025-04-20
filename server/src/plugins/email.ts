import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import config from "../config";
import { EmailService } from "../services/email/EmailService";
import { MockEmailService } from "../services/email/MockEmailService";
import { SendGridEmailService } from "../services/email/SendGridEmailService";

declare module "fastify" {
  interface FastifyInstance {
    emailService: EmailService;
  }
}

async function emailPlugin(fastify: FastifyInstance) {
  let emailService: EmailService;

  if (config.nodeEnv === "test") {
    console.log("Using MockEmailService for testing");
    emailService = new MockEmailService();
  } else {
    if (!config.emailConfig.sendgridApiKey) {
      throw new Error(
        "SENDGRID_API_KEY is missing in emailConfig for non-test environment.",
      );
    }
    if (!config.emailConfig.fromAddress) {
      throw new Error(
        "EMAIL_FROM is missing in emailConfig for non-test environment.",
      );
    }
    console.log("Using SendGridEmailService");
    emailService = new SendGridEmailService();
  }

  fastify.decorate("emailService", emailService);
}

export default fp(emailPlugin, {
  name: "email-service",
});
