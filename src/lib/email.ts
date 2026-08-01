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

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendDeletionWarningEmail(email: string, filename: string, slug: string) {
  const fileUrl = `${process.env.NEXTAUTH_URL}/f/${slug}`;
  const pricingUrl = `${process.env.NEXTAUTH_URL}/pricing`;
  const safeFilename = escapeHtml(filename);

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[dev] Deletion warning for ${email}: "${filename}" (${fileUrl})`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `Bluto Box <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Your file "${filename}" will be deleted in 3 days`,
      html: `<p>Your file <strong>${safeFilename}</strong> hasn't been downloaded in a while and is scheduled to be automatically deleted in 3 days due to inactivity (Free plan files are removed after 30 days with no downloads).</p><p><a href="${fileUrl}">${fileUrl}</a></p><p>Download it now to keep a copy, or <a href="${pricingUrl}">upgrade to Pro</a> to keep your files permanently — Pro-owned files are never auto-deleted.</p>`,
    });
  } catch (error) {
    console.error(`[email] Failed to send deletion warning to ${email}:`, error);
    throw new Error("Failed to send deletion warning email");
  }
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
