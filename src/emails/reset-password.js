```javascript
const APP_NAME = 'TeamFlow PM';

/**
 * Generate password reset email HTML and text content
 * @param {string} resetLink - Password reset link
 * @returns {Object} - { html, text }
 */
function generateResetPasswordEmail(resetLink) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your ${APP_NAME} Password</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #0f1419 0%, #1a2029 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .header h1 {
            margin: 0;
            font-family: 'Bebas Neue', sans-serif;
            font-size: 32px;
            letter-spacing: 1px;
            color: #0ee4d5;
        }
        .content {
            padding: 40px 30px;
        }
        .alert-box {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 25px;
            color: #92400e;
        }
        .reset-button {
            display: inline-block;
            background-color: #0ee4d5;
            color: #0f1419;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            transition: background-color 0.2s;
        }
        .reset-button:hover {
            background-color: #0bc9bb;
        }
        .info-box {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #3b82f6;
        }
        .footer {
            text-align: center;
            padding: 30px 20px;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }
        .footer a {
            color: #64748b;
            text-decoration: none;
        }
        .footer a:hover {
            color: #0ee4d5;
        }
        .link-text {
            word-break: break-all;
            color: #3b82f6;
            background-color: #f1f5f9;
            padding: 10px;
            border-radius: 4px;
            font-size: 14px;
            margin: 15px 0;
        }
        @media (max-width: 600px) {
            .container {
                padding: 10px;
            }
            .content {
                padding: 20px 15px;
            }
            .header {
                padding: 25px 15px;
            }
            .header h1 {
                font-size: 26px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${APP_NAME}</h1>
            <p>Password Reset Request</p>
        </div>
        
        <div class="content">
            <h2>Reset Your Password</h2>
            
            <div class="alert-box">
                <strong>Important:</strong> This password reset link will expire in 1 hour.
            </div>
            
            <p>We received a request to reset your password for your ${APP_NAME} account.</p>
            
            <p>If you didn't request this, you can safely ignore this email.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" class="reset-button">
                    Reset Password
                </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <div class="link-text">${resetLink}</div>
            
            <div class="info-box">
                <h3 style="margin-top: 0;">Security Tips:</h3>
                <ul style="margin-bottom: 0;">
                    <li>Never share your password with anyone</li>
                    <li>Use a strong, unique password</li>
                    <li>Enable two-factor authentication for added security</li>
                    <li>Regularly update your password</li>
                </ul>
            </div>
            
            <p>
                If you're having trouble clicking the button, copy and paste the URL above 
                into your web browser.
            </p>
            
            <p>
                Need help? <a href="${process.env.FRONTEND_URL || 'https://app.teamflowpm.com'}/support">Contact our support team</a>.
            </p>
        </div>
        
        <div class="footer">
            <p>
                ${APP_NAME} • 123 Business St, San Francisco, CA 94107<br>
                <a href="${process.env.FRONTEND_URL || 'https://app.teamflowpm.com'}/privacy">Privacy Policy</a> • 
                <a href="${process.env.FRONTEND_URL || 'https://app.teamflowpm.com'}/terms">Terms of Service</a>
            </p>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
  `;

  const text = `
Reset Your ${APP_NAME} Password

We received a request to reset your password for your ${APP_NAME} account.

IMPORTANT: This password reset link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

To reset your password, click the link below:
${resetLink}

Or copy and paste the URL into your browser.

Security Tips:
- Never share your password with anyone
- Use a strong, unique password
- Enable two-factor authentication for added security
- Regularly update your password

If you're having trouble, contact our support team: ${process.env.FRONTEND_URL || 'https://app.teamflowpm.com'}/support

---
${APP_NAME} • 123 Business St, San Francisco, CA 94107
Privacy Policy: ${process.env.FRONTEND_URL || 'https://app.teamflowpm.com'}/privacy
Terms of Service: ${process.env.FRONTEND_URL || 'https://app.teamflowpm.com'}/terms

This is an automated message. Please do not reply to this email.
  `;

  return { html, text };
}

module.exports = {
  generateResetPasswordEmail,
};
```