import nodemailer from "nodemailer";

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return _transporter;
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;

  const transporter = getTransporter();
  if (!transporter) {
    // No email provider configured yet (e.g. local dev before Gmail SMTP is set up).
    console.log(`[dev] Verification link for ${email}: ${verifyUrl}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `Bluto Box <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `<p>Click the link below to verify your email address:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`,
    });
  } catch (error) {
    console.error(`[email] Failed to send verification email to ${email}:`, error);
    throw new Error("Failed to send verification email");
  }
}
