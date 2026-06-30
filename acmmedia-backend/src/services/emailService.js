/**
 * Email Service
 * 
 * Handles sending beautiful, responsive HTML emails for:
 * - Welcome emails
 * - Email verification
 * - Password reset
 * - Password changed confirmations
 * - Security alerts
 * - Login notifications
 * 
 * Uses nodemailer for SMTP delivery.
 * 
 * @module services/emailService
 */

const nodemailer = require("nodemailer");

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter connection (optional, can be done on startup)
if (process.env.NODE_ENV !== "test") {
  transporter.verify((error) => {
    if (error) {
      console.error("Email transporter error:", error);
    } else {
      console.log("Email service ready");
    }
  });
}

const APP_NAME = process.env.APP_NAME || "ACM XIM ENVOY";
const APP_URL = process.env.APP_URL || "https://acm-xim.local";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@acmxim.space";

/**
 * Base HTML email template
 */
function getEmailTemplate(title, content, actionUrl, actionText) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .content p { margin: 15px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          .button:hover { background: #764ba2; }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
          .code { background: #f0f0f0; padding: 15px; border-left: 4px solid #667eea; font-family: monospace; margin: 15px 0; border-radius: 4px; }
          .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .success { background: #d4edda; border-left: 4px solid #28a745; color: #155724; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .warning { background: #f8d7da; border-left: 4px solid #dc3545; color: #721c24; padding: 15px; margin: 15px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            ${content}
            ${
              actionUrl
                ? `<center><a href="${actionUrl}" class="button">${actionText || "View"}</a></center>`
                : ""
            }
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
              This is an automated email from ${APP_NAME}. Please do not reply to this email.
            </p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2026 ${APP_NAME}. All rights reserved.</p>
          <p><a href="${APP_URL}" style="color: #667eea; text-decoration: none;">Visit our platform</a></p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(email, name) {
  const content = `
    <p>Welcome to <strong>${APP_NAME}</strong>, ${name}!</p>
    <p>We're excited to have you join our community of tech enthusiasts and builders.</p>
    <p>Here's what you can do:</p>
    <ul>
      <li>Complete your profile to unlock exclusive features</li>
      <li>Join discussions and share your ideas</li>
      <li>Discover upcoming events and workshops</li>
      <li>Connect with fellow members</li>
    </ul>
    <div class="success">
      <strong>Account Created Successfully!</strong><br>
      Your account is ready to use. Start exploring our community today.
    </div>
  `;

  return sendEmail(email, "Welcome to ACM XIM ENVOY!", content, `${APP_URL}/profile`, "Complete Your Profile");
}

/**
 * Send email verification email
 */
async function sendVerificationEmail(email, name, verificationLink) {
  const content = `
    <p>Hi ${name},</p>
    <p>Please verify your email address to activate your account.</p>
    <p>Click the button below to verify your email:</p>
    <div class="alert">
      <strong>Verification Link</strong><br>
      This link expires in 15 minutes. If you didn't create this account, please ignore this email.
    </div>
  `;

  return sendEmail(email, "Verify Your Email Address", content, verificationLink, "Verify Email");
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, name, resetLink) {
  const content = `
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <div class="alert">
      <strong>Security Notice</strong><br>
      This link expires in 15 minutes. If you didn't request this, please ignore this email and your password will remain unchanged.
    </div>
    <p><strong>Password Requirements:</strong></p>
    <ul>
      <li>Minimum 8 characters</li>
      <li>At least 1 uppercase letter</li>
      <li>At least 1 lowercase letter</li>
      <li>At least 1 number</li>
      <li>At least 1 special character</li>
    </ul>
  `;

  return sendEmail(email, "Reset Your Password", content, resetLink, "Reset Password");
}

/**
 * Send password changed confirmation
 */
async function sendPasswordChangedEmail(email, name, ipAddress, timestamp) {
  const content = `
    <p>Hi ${name},</p>
    <div class="success">
      <strong>Password Changed Successfully</strong><br>
      Your password was changed on ${new Date(timestamp).toLocaleString()}
    </div>
    <p><strong>Login Details:</strong></p>
    <ul>
      <li>IP Address: ${ipAddress}</li>
      <li>Timestamp: ${new Date(timestamp).toLocaleString()}</li>
    </ul>
    <p>If you didn't make this change, <strong><a href="${APP_URL}/security">secure your account immediately</a></strong>.</p>
  `;

  return sendEmail(email, "Password Changed", content);
}

/**
 * Send suspicious login alert
 */
async function sendLoginAlertEmail(email, name, ipAddress, browser, location) {
  const content = `
    <p>Hi ${name},</p>
    <div class="warning">
      <strong>New Login Detected</strong><br>
      A new login to your account was detected from an unfamiliar location.
    </div>
    <p><strong>Login Details:</strong></p>
    <ul>
      <li>Location: ${location || "Unknown"}</li>
      <li>Browser: ${browser || "Unknown"}</li>
      <li>IP Address: ${ipAddress}</li>
      <li>Time: ${new Date().toLocaleString()}</li>
    </ul>
    <p>If this wasn't you, <strong><a href="${APP_URL}/security">review your security settings</a></strong> and consider changing your password.</p>
  `;

  return sendEmail(email, "New Login to Your Account", content, `${APP_URL}/security`, "Review Security");
}

/**
 * Send account security alert
 */
async function sendSecurityAlertEmail(email, name, alertType, details) {
  const alertMessages = {
    FAILED_LOGIN_ATTEMPTS: {
      subject: "Multiple Failed Login Attempts",
      content: `<p>We detected ${details.attempts} failed login attempts to your account. Your account has been temporarily locked for security.</p>`,
    },
    DEVICE_REVOKED: {
      subject: "Device Session Revoked",
      content: `<p>A device session was revoked from your account: ${details.deviceName}.</p>`,
    },
    EMAIL_CHANGED: {
      subject: "Email Address Changed",
      content: `<p>Your email address was changed to: ${details.newEmail}. If you didn't make this change, contact support immediately.</p>`,
    },
  };

  const alert = alertMessages[alertType] || { subject: "Security Alert", content: "<p>A security event occurred on your account.</p>" };

  return sendEmail(email, alert.subject, `<p>Hi ${name},</p>${alert.content}<p><a href="${APP_URL}/security">Review Security Settings</a></p>`);
}

/**
 * Generic email sender
 */
async function sendEmail(to, subject, content, actionUrl = null, actionText = null) {
  try {
    const htmlContent = getEmailTemplate(subject, content, actionUrl, actionText);

    const mailOptions = {
      from: FROM_EMAIL,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendLoginAlertEmail,
  sendSecurityAlertEmail,
  sendEmail,
};
