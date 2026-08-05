import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = "Bluto Box <noreply@blutobox.com>";

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

  const resend = getResend();
  if (!resend) {
    console.log(`[dev] Deletion warning for ${email}: "${filename}" (${fileUrl})`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your file "${filename}" will be deleted in 3 days`,
    html: `<p>Your file <strong>${safeFilename}</strong> hasn't been downloaded in a while and is scheduled to be automatically deleted in 3 days due to inactivity (Free plan files are removed after 30 days with no downloads).</p><p><a href="${fileUrl}">${fileUrl}</a></p><p>Download it now to keep a copy, or <a href="${pricingUrl}">upgrade to Pro</a> to keep your files permanently — Pro-owned files are never auto-deleted.</p>`,
  });
  if (error) {
    console.error(`[email] Failed to send deletion warning to ${email}:`, error);
    throw new Error("Failed to send deletion warning email");
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const resend = getResend();
  if (!resend) {
    console.log(`[dev] Password reset link for ${email}: ${resetUrl}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your password",
    html: `<p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
  });
  if (error) {
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

  const resend = getResend();
  if (!resend) {
    console.log(`[dev] Share link for ${recipientEmail}: "${filename}" (${fileUrl})`);
    return;
  }

  const intro = safeSender
    ? `<strong>${safeSender}</strong> shared a file with you via Bluto Box:`
    : `Someone shared a file with you via Bluto Box:`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: recipientEmail,
    subject: safeSender ? `${safeSender} sent you a file via Bluto Box` : "You've got a file on Bluto Box",
    html: `<p>${intro}</p><p><strong>${safeFilename}</strong></p>${
      safeMessage ? `<p>&quot;${safeMessage}&quot;</p>` : ""
    }<p><a href="${fileUrl}">${fileUrl}</a></p>`,
  });
  if (error) {
    console.error(`[email] Failed to send share link to ${recipientEmail}:`, error);
    throw new Error("Failed to send email");
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

  const resend = getResend();
  if (!resend) {
    // No email provider configured yet (e.g. local dev before Resend is set up).
    console.log(`[dev] Verification link for ${email}: ${verifyUrl}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your email",
    html: `<p>Click the link below to verify your email address:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`,
  });
  if (error) {
    console.error(`[email] Failed to send verification email to ${email}:`, error);
    throw new Error("Failed to send verification email");
  }
}
