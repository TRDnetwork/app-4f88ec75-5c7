```javascript
const { Resend } = require('resend');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email (can be overridden)
const DEFAULT_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const APP_NAME = 'TeamFlow PM';

/**
 * Send an email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @param {string} options.from - Sender email (optional)
 * @returns {Promise<Object>} - Resend response
 */
async function sendEmail({ to, subject, html, text, from = DEFAULT_FROM }) {
  try {
    // Don't send emails in development without RESEND_API_KEY
    if (process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY) {
      console.log('[Email] Development mode - email not sent:', { to, subject });
      return { success: true, message: 'Email skipped in development' };
    }

    const data = await resend.emails.send({
      from: `${APP_NAME} <${from}>`,
      to,
      subject,
      html,
      text,
      reply_to: process.env.EMAIL_REPLY_TO || from,
    });

    console.log('[Email] Sent successfully:', { to, subject, id: data.id });
    return { success: true, data };
  } catch (error) {
    console.error('[Email] Failed to send:', error.message);
    // Don't throw error - email failures shouldn't crash the app
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email to new user
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>} - Send result
 */
async function sendWelcomeEmail(email, name) {
  const { generateWelcomeEmail } = require('../emails/welcome');
  const { html, text } = generateWelcomeEmail(name);
  
  return sendEmail({
    to: email,
    subject: `Welcome to ${APP_NAME}!`,
    html,
    text,
  });
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} - Send result
 */
async function sendPasswordResetEmail(email, resetToken) {
  const { generateResetPasswordEmail } = require('../emails/reset-password');
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const { html, text } = generateResetPasswordEmail(resetLink);
  
  return sendEmail({
    to: email,
    subject: `Reset Your ${APP_NAME} Password`,
    html,
    text,
  });
}

/**
 * Send workspace invitation email
 * @param {string} email - Invitee email
 * @param {string} inviterName - Name of person inviting
 * @param {string} workspaceName - Workspace name
 * @param {string} inviteLink - Invitation link
 * @returns {Promise<Object>} - Send result
 */
async function sendWorkspaceInviteEmail(email, inviterName, workspaceName, inviteLink) {
  const { generateWorkspaceInviteEmail } = require('../emails/workspace-invite');
  const { html, text } = generateWorkspaceInviteEmail(inviterName, workspaceName, inviteLink);
  
  return sendEmail({
    to: email,
    subject: `${inviterName} invited you to join "${workspaceName}" on ${APP_NAME}`,
    html,
    text,
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendWorkspaceInviteEmail,
};
```