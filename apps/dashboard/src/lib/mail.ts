import nodemailer from "nodemailer";

/**
 * Email utilities
 * In development, logs to console instead of sending
 */

const transporter =
  process.env.NODE_ENV === "production" && process.env.MAIL_TRANSPORT
    ? nodemailer.createTransport(process.env.MAIL_TRANSPORT)
    : {
        // Development: log to console
        sendMail: async (options: nodemailer.SendMailOptions) => {
          console.log("📧 Email (dev mode):", {
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
          });
          return { messageId: "dev-message-id" };
        },
      };

/**
 * Sends an email
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || "noreply@meform.com",
    ...options,
  });
}

/**
 * Sends email verification email
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Verify your email",
    text: `Click this link to verify your email: ${url}`,
    html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
  });
}

/**
 * Sends password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Reset your password",
    text: `Click this link to reset your password: ${url}`,
    html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
  });
}

