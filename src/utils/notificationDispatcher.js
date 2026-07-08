import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { sendEmail } from './emailService.js';

const getEmailTemplate = (title, message, actionUrl, actionText) => {
  const formattedMessage = message.replace(/\n/g, '<br/>');
  
  // Ensure actionUrl is absolute for email clients
  let absoluteActionUrl = actionUrl;
  if (actionUrl && actionUrl.startsWith('/')) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    absoluteActionUrl = `${baseUrl}${actionUrl}`;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>GreenLeaf Notification</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f3f4f6;
          color: #1f2937;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          width: 100%;
          background-color: #f3f4f6;
          padding: 40px 20px;
          box-sizing: border-box;
        }
        .main {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
        }
        .header {
          background-color: #020817;
          padding: 30px;
          text-align: center;
          border-bottom: 4px solid #10b981;
        }
        .header h1 {
          margin: 0;
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .header-subtitle {
          color: #10b981;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 4px 0 0 0;
        }
        .content {
          padding: 40px 30px;
        }
        .badge {
          display: inline-block;
          background-color: #ecfdf5;
          color: #059669;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 20px 0;
          line-height: 1.4;
        }
        .message-box {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 30px;
          border-left: 4px solid #10b981;
        }
        .message {
          font-size: 15px;
          line-height: 1.6;
          color: #4b5563;
          margin: 0;
        }
        .action-card {
          text-align: left;
        }
        .btn {
          display: inline-block;
          background-color: #10b981;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 15px;
          text-align: center;
        }
        .footer {
          padding: 30px;
          background-color: #f9fafb;
          text-align: center;
          border-top: 1px solid #f3f4f6;
        }
        .footer-brand {
          color: #111827;
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }
        .footer-tagline {
          color: #059669;
          font-size: 11px;
          font-weight: 600;
          margin: 0 0 16px 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .footer-text {
          color: #6b7280;
          font-size: 12px;
          line-height: 1.5;
          margin: 0;
        }
        @media only screen and (max-width: 480px) {
          .wrapper { padding: 20px 10px; }
          .header { padding: 24px 20px; }
          .content { padding: 30px 20px; }
          .footer { padding: 24px 20px; }
          .btn { display: block; width: 100%; box-sizing: border-box; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="main">
          
          <!-- Header -->
          <div class="header">
            <h1>GreenLeaf</h1>
            <p class="header-subtitle">Data Center</p>
          </div>

          <!-- Content -->
          <div class="content">
            <div class="badge">System Notification</div>
            <h2 class="title">${title}</h2>
            
            <div class="message-box">
              <p class="message">${formattedMessage}</p>
            </div>

            ${absoluteActionUrl ? `
            <div class="action-card">
              <a href="${absoluteActionUrl}" class="btn">
                ${actionText || 'View Details'}
              </a>
            </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-brand">GreenLeaf Data Center</p>
            <p class="footer-tagline">Enterprise Cloud &bull; AI Servers &bull; Colocation</p>
            <p class="footer-text">This is an automated system notification.</p>
            <p class="footer-text">Please do not reply directly to this email.</p>
            <p class="footer-text" style="margin-top: 12px; font-size: 11px;">&copy; ${new Date().getFullYear()} GreenLeaf Agencies. All rights reserved.</p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Dispatches a notification to a user or admin, saving to DB and optionally sending an email.
 * 
 * @param {Object} payload
 * @param {number} payload.userId - ID of the User or Admin
 * @param {string} payload.userType - 'admin' | 'customer'
 * @param {string} payload.category - e.g. 'Sales Requests', 'Quotes', 'Payments'
 * @param {string} payload.priority - 'low' | 'medium' | 'high' | 'critical'
 * @param {string} payload.title - Notification Title
 * @param {string} payload.message - Notification Message/Body
 * @param {string} [payload.relatedModule] - e.g. 'Quote', 'Payment'
 * @param {number} [payload.relatedRecordId] - ID of the related record
 * @param {string} [payload.actionUrl] - URL to navigate when clicked
 * @param {boolean} [payload.sendEmailFlag=false] - Whether to also send an HTML email
 * @param {string} [payload.actionText] - Text for the email CTA button
 */
export const dispatchNotification = async ({
  userId,
  userType,
  category,
  priority = 'low',
  title,
  message,
  relatedModule,
  relatedRecordId,
  actionUrl,
  sendEmailFlag = false,
  actionText = 'View Details'
}) => {
  try {
    let emailAddress = null;
    let actualUserId = null;
    let actualAdminId = null;

    if (userType === 'customer') {
      actualUserId = userId;
      if (sendEmailFlag) {
        const user = await User.findByPk(userId);
        if (user) emailAddress = user.email;
      }
    } else if (userType === 'admin') {
      actualAdminId = userId;
      if (sendEmailFlag) {
        const admin = await Admin.findByPk(userId);
        if (admin) emailAddress = admin.email;
      }
    }

    // Create Notification Record
    const notification = await Notification.create({
      user_id: actualUserId,
      admin_id: actualAdminId,
      user_type: userType,
      category,
      priority,
      title,
      message,
      related_module: relatedModule,
      related_record_id: relatedRecordId,
      action_url: actionUrl,
      is_read: false
    });

    // Send Email if requested
    if (sendEmailFlag && emailAddress) {
      const htmlContent = getEmailTemplate(title, message, actionUrl, actionText);
      const emailSent = await sendEmail(emailAddress, `[GreenLeaf] ${title}`, htmlContent);
      
      if (emailSent) {
        notification.email_sent = true;
        notification.email_sent_at = new Date();
        await notification.save();
      }
    }

    return notification;
  } catch (error) {
    console.error('Error dispatching notification:', error);
    return null;
  }
};
