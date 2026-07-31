import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;

  if (!resend) {
    // No email provider configured yet (e.g. local dev before Resend is set up).
    console.log(`[dev] Verification link for ${email}: ${verifyUrl}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@localhost",
    to: email,
    subject: "Verify your email",
    html: `<p>Click the link below to verify your email address:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`,
  });

  if (error) {
    console.error(`[email] Failed to send verification email to ${email}:`, error);
    throw new Error("Failed to send verification email");
  }
}
