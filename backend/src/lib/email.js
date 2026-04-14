/**
 * Email helper — sends transactional emails via Resend.
 *
 * Setup (free tier, no credit card):
 *  1. Sign up at https://resend.com
 *  2. Add and verify your domain (or use the free onboarding.resend.dev sandbox)
 *  3. Create an API key
 *  4. Add RESEND_API_KEY and EMAIL_FROM to your .env
 *
 * Run: npm install resend
 */

// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a password reset email.
 * @param {string} to      - recipient email address
 * @param {string} resetUrl - full URL with token and userId params
 */
export async function sendPasswordResetEmail(to, resetUrl) {
  // ── OPTION A: Resend (recommended) ───────────────────────────────────────
  // Uncomment after running: npm install resend
  //
  // await resend.emails.send({
  //   from:    process.env.EMAIL_FROM || "DPT <noreply@yourdomain.com>",
  //   to,
  //   subject: "Reset your Digital Presence Tracker password",
  //   html: `
  //     <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
  //       <h2 style="color: #0f2421;">Reset your password</h2>
  //       <p>Click the button below to set a new password. This link expires in 1 hour.</p>
  //       <a href="${resetUrl}"
  //          style="display:inline-block;padding:12px 24px;background:#2DD4BF;color:#080e0c;
  //                 font-weight:700;text-decoration:none;border-radius:8px;margin:16px 0;">
  //         Reset Password
  //       </a>
  //       <p style="color:#666;font-size:13px;">
  //         If you did not request this, ignore this email.
  //         Your password will not change.
  //       </p>
  //       <p style="color:#999;font-size:12px;">
  //         Or copy this link: ${resetUrl}
  //       </p>
  //     </div>
  //   `,
  // });

  // ── OPTION B: Log to console (development fallback) ──────────────────────
  // Remove this in production once Resend is configured.
  console.log("\n─────────────────────────────────────────────────");
  console.log("PASSWORD RESET EMAIL (development — not sent)");
  console.log(`To:  ${to}`);
  console.log(`URL: ${resetUrl}`);
  console.log("─────────────────────────────────────────────────\n");
}
