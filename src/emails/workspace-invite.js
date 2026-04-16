```javascript
const APP_NAME = 'TeamFlow PM';

/**
 * Generate workspace invitation email HTML and text content
 * @param {string} inviterName - Name of person inviting
 * @param {string} workspaceName - Workspace name
 * @param {string} inviteLink - Invitation link
 * @returns {Object} - { html, text }
 */
function generateWorkspaceInviteEmail(inviterName, workspaceName, inviteLink) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're invited to join ${workspaceName} on ${APP_NAME}</title>
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
        .inviter-card {
            display: flex;
            align-items: center;
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .inviter-avatar {
            width: 60px;
            height: 60px;
            background-color: #0ee4d5;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #0f1419;
            margin-right: 20px;
        }
        .workspace-card {
            background-color: #1a2029;
            color: white;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }
        .workspace-card h3 {
            color: #0ee4d5;
            margin-top: 0;
            font-size: 24px;
        }
        .accept-button {
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
        .accept-button:hover {
            background-color: #0bc9bb;
        }
        .footer {
            text-align: center;
            padding: 30px 20px;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
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
            .inviter-card {
                flex-direction: column;
                text-align: center;
            }
            .inviter-avatar {
                margin-right: 0;
                margin-bottom: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${APP_NAME}</h1>
            <p>Team Collaboration Platform</p>
        </div>
        
        <div class="content">
            <h2>You're Invited!</h2>
            
            <div class="inviter-card">
                <div class="inviter-avatar">${inviterName.charAt(0).toUpperCase()}</div>
                <div>
                    <h3 style="margin: 0 0 5px 0;">${inviterName}</h3>
                    <p style="margin: 0; color: #64748b;">has invited you to join a workspace</p>
                </div>
            </div>
            
            <div class="workspace-card">
                <h3>${workspaceName}</h3>
                <p>Join this workspace to collaborate on projects, manage tasks, and work together with your team.</p>
            </div>
            
            <div style="text-align: center;">
                <a href="${inviteLink}" class="accept-button">
                    Accept Invitation
                </a>
            </div>
            
            <p style="text-align: center; color: #64748b;">
                This invitation will expire in 7 days.
            </p>
            
            <p>
                What you can do in ${APP_NAME}:
            </p>
            <ul>
                <li>Create and manage tasks with drag-and-drop</li>
                <li>Collaborate with team members in real-time</li>
                <li>Track project progress with visual boards</li>
                <li>Share files and communicate in context</li>
            </ul>
            
            <p>
                If you don't have a ${APP_NAME} account yet, you'll be prompted to create one 
                when you accept the invitation.
            </p>
            
            <p>
                Questions? <a href="${process.env.FRONTEND_URL || 'https://app.teamflowpm.com'}/support">Contact support</a>
            </p>
        </div>
        
        <div class="footer">
            <p>
                ${APP_NAME} • 123 Business St, San Francisco, CA 94107<br>
                <a href="${process.env.FRONTEND_URL || 'https://app.teamflowpm.com'}/privacy">Privacy Policy</a> • 
                <a href="${process.env.FRONTEND_URL || 'https://app.teamflowpm.com'}/terms">Terms of Service</a>
            </p>
        </div>
    </div>
</body>
</html>
  `;

  const text = `
You're Invited to Join ${workspaceName} on ${APP_NAME}

${inviterName} has invited you to join the workspace "${workspaceName}" on ${APP_NAME}.

Join this workspace to collaborate on projects, manage tasks, and work together with your team.

Accept the invitation here: ${inviteLink}

This invitation will expire in 7 days.

What you can do in ${APP_NAME}:
- Create and manage tasks with drag-and-drop
- Collaborate with team members in real-time
- Track project progress with visual boards
- Share files and communicate in context

If you don't have a ${APP_NAME} account yet, you'll be prompted to create one when you accept the invitation.

Questions? Contact support: ${process.env.FRONTEND_URL || 'https://app.teamflowpm.com'}/support

---
${APP_NAME} • 123 Business St, San Francisco, CA 94107
Privacy Policy: ${process.env.FRONTEND_URL || 'https://app.teamflowpm.com'}/privacy
Terms of Service: ${process.env.FRONTEND_URL || 'https://app.teamflowpm.com'}/terms
  `;

  return { html, text };
}

module.exports = {
  generateWorkspaceInviteEmail,
};
```