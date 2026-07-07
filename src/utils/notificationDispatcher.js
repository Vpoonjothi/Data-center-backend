import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { sendEmail } from './emailService.js';

const getEmailTemplate = (title, message, actionUrl, actionText) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 40px 0; }
        .main { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #0B1220; padding: 32px 40px; text-align: left; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
        .content { padding: 40px; }
        .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
        .message { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 30px; }
        .action-button { display: inline-block; background-color: #22C55E; color: #ffffff; font-weight: 600; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 15px; }
        .footer { padding: 30px 40px; background-color: #f1f5f9; text-align: center; font-size: 13px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="main">
          <div class="header">
            <h1>GreenLeaf Data Center</h1>
          </div>
          <div class="content">
            <h2 class="title">${title}</h2>
            <div class="message">${message.replace(/\n/g, '<br/>')}</div>
            ${actionUrl ? `<a href="${actionUrl}" class="action-button">${actionText || 'View Details'}</a>` : ''}
          </div>
          <div class="footer">
            <p>This is an automated notification from GreenLeaf Data Center.</p>
            <p>If you need assistance, please contact support@greenleaf-datacenter.com</p>
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
