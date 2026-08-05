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

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[dev] Password reset link for ${email}: ${resetUrl}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `Bluto Box <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `<p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
    });
  } catch (error) {
    console.error(`[email] Failed to send password reset email to ${email}:`, error);
    throw new Error("Failed to send password reset email");
  }
}

export async function sendShareLinkEmail(params: {
  recipientEmail: string;
  fileUrl: string;
  filename: string;
  senderName?: string;
  message?: string;
}) {
  const { recipientEmail, fileUrl, filename, senderName, message } = params;
  const safeFilename = escapeHtml(filename);
  const safeSender = senderName ? escapeHtml(senderName) : null;
  const safeMessage = message ? escapeHtml(message) : null;

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[dev] Share link for ${recipientEmail}: "${filename}" (${fileUrl})`);
    return;
  }

  const intro = safeSender
    ? `<strong>${safeSender}</strong> shared a file with you via Bluto Box:`
    : `Someone shared a file with you via Bluto Box:`;

  try {
    await transporter.sendMail({
      from: `Bluto Box <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: safeSender ? `${safeSender} sent you a file via Bluto Box` : "You've got a file on Bluto Box",
      html: `<p>${intro}</p><p><strong>${safeFilename}</strong></p>${
        safeMessage ? `<p>&quot;${safeMessage}&quot;</p>` : ""
      }<p><a href="${fileUrl}">${fileUrl}</a></p>`,
    });
  } catch (error) {
    console.error(`[email] Failed to send share link to ${recipientEmail}:`, error);
    throw new Error("Failed to send email");
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

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
