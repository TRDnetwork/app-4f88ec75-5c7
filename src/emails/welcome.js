```javascript
const APP_NAME = 'TeamFlow PM';
const APP_URL = process.env.FRONTEND_URL || 'https://app.teamflowpm.com';

/**
 * Generate welcome email HTML and text content
 * @param {string} name - User's name
 * @returns {Object} - { html, text }
 */
function generateWelcomeEmail(name) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${APP_NAME}</title>
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
            padding: 40px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .header h1 {
            margin: 0;
            font-family: 'Bebas Neue', sans-serif;
            font-size: 36px;
            letter-spacing: 1px;
            color: #0ee4d5;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-text {
            font-size: 18px;
            margin-bottom: 30px;
            color: #1a2029;
        }
        .highlight {
            color: #0ee4d5;
            font-weight: 600;
        }
        .cta-button {
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
        .cta-button:hover {
            background-color: #0bc9bb;
        }
        .features {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            border-left: 4px solid #0ee4d5;
        }
        .features h3 {
            color: #1a2029;
            margin-top: 0;
        }
        .features ul {
            margin: 0;
            padding-left: 20px;
        }
        .features li {
            margin-bottom: 10px;
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
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            margin: 0 10px;
            color: #64748b;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .container {
                padding: 10px;
            }
            .content {
                padding: 20px 15px;
            }
            .header {
                padding: 30px 15px;
            }
            .header h1 {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${APP_NAME}</h1>
            <p>Collaborative Project Management</p>
        </div>
        
        <div class="content">
            <h2>Welcome aboard, ${name}!</h2>
            
            <p class="welcome-text">
                Thank you for joining <span class="highlight">${APP_NAME}</span>. 
                We're excited to help you and your team manage projects more effectively.
            </p>
            
            <div style="text-align: center;">
                <a href="${APP_URL}/dashboard" class="cta-button">
                    Go to Your Dashboard
                </a>
            </div>
            
            <div class="features">
                <h3>Get started with these features:</h3>
                <ul>
                    <li><strong>Create workspaces</strong> for different teams or projects</li>
                    <li><strong>Build task boards</strong> with drag-and-drop functionality</li>
                    <li><strong>Invite team members</strong> and collaborate in real-time</li>
                    <li><strong>Track progress</strong> with visual boards and analytics</li>
                    <li><strong>Upgrade to Pro</strong> for unlimited workspaces and advanced features</li>
                </ul>
            </div>
            
            <p>
                Need help getting started? Check out our 
                <a href="${APP_URL}/guides">getting started guide</a> or 
                <a href="${APP_URL}/support">contact our support team</a>.
            </p>
            
            <p>
                Best regards,<br>
                The ${APP_NAME} Team
            </p>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="${APP_URL}/blog">Blog</a> • 
                <a href="${APP_URL}/twitter">Twitter</a> • 
                <a href="${APP_URL}/linkedin">LinkedIn</a>
            </div>
            <p>
                ${APP_NAME} • 123 Business St, San Francisco, CA 94107<br>
                <a href="${APP_URL}/unsubscribe?email=${encodeURIComponent('{{email}}')}">Unsubscribe</a> • 
                <a href="${APP_URL}/privacy">Privacy Policy</a> • 
                <a href="${APP_URL}/terms">Terms of Service</a>
            </p>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
                This email was sent to {{email}}. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
  `;

  const text = `
Welcome to ${APP_NAME}, ${name}!

Thank you for joining ${APP_NAME}. We're excited to help you and your team manage projects more effectively.

Get started by visiting your dashboard: ${APP_URL}/dashboard

Key features to explore:
- Create workspaces for different teams or projects
- Build task boards with drag-and-drop functionality
- Invite team members and collaborate in real-time
- Track progress with visual boards and analytics
- Upgrade to Pro for unlimited workspaces and advanced features

Need help getting started? Check out our getting started guide: ${APP_URL}/guides
Or contact our support team: ${APP_URL}/support

Best regards,
The ${APP_NAME} Team

---
${APP_NAME} • 123 Business St, San Francisco, CA 94107
Unsubscribe: ${APP_URL}/unsubscribe
Privacy Policy: ${APP_URL}/privacy
Terms of Service: ${APP_URL}/terms

This email was sent to {{email}}. Please do not reply to this email.
  `;

  return { html, text };
}

module.exports = {
  generateWelcomeEmail,
};
```