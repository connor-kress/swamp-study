import { EmailService } from "./EmailService";

export interface SentEmailData {
  email: string;
  name: string;
  code: string;
}

/**
 * A mock implementation of the EmailService for testing purposes.
 * It does not actually send emails but records the calls made to it.
 */
export class MockEmailService implements EmailService {
  public sentEmails: SentEmailData[] = [];

  async sendVerificationCode(
    email: string,
    name: string,
    code: string,
  ): Promise<void> {
    console.log(
      `MOCK EmailService: Recording verification code "${code
      }" for ${email} (Name: ${name})`,
    );

    this.sentEmails.push({ email, name, code });

    return Promise.resolve(); // simulate success
  }

  // Helper Methods

  clearSentEmails(): void {
    this.sentEmails = [];
  }

  getLastSentEmail(): SentEmailData | undefined {
    if (this.sentEmails.length === 0) {
      return undefined;
    }
    return this.sentEmails[this.sentEmails.length - 1];
  }

  findCodeForEmail(email: string): string | undefined {
    const sentData = this.sentEmails.find((e) => e.email === email);
    return sentData?.code;
  }
}
