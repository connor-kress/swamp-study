/**
 * Interface defining the contract for sending emails.
 */
export interface EmailService {
  /**
   * Sends a verification code via email.
   * @param to - Recipient email address.
   * @param name - Recipient's name (for personalization).
   * @param code - The verification code to send.
   * @returns Promise that resolves when the email is sent or rejects on error.
   */
  sendVerificationCode(
    email: string,
    name: string,
    code: string,
  ): Promise<void>;
}
