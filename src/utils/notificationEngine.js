import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { sendEmail } from './emailService.js';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://greenleaf-datacenter.com'
  : 'http://localhost:5173';

const getEmailTemplate = (user, service, stage, daysRemaining) => {
  let title = '';
  let subtitle = '';
  let actionText = '';
  let actionLink = `${BASE_URL}/dashboard/services`;
  let actionButtonLabel = 'Renew Subscription';
  let bannerColor = '#22C55E'; // Green
  let bannerBg = '#f0fdf4';
  
  const expiryDate = new Date(service.next_due_date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  switch (stage) {
    case '30_days':
    case '15_days':
      title = 'Subscription Renewal Reminder';
      subtitle = `Your server subscription for ${service.service_name} expires in ${daysRemaining} days.`;
      actionText = 'No immediate action is required, but you can review your subscription now.';
      break;
    case '7_days':
    case '3_days':
      title = 'Upcoming Subscription Expiry';
      subtitle = `Your server subscription for ${service.service_name} expires in ${daysRemaining} days.`;
      actionText = 'Please renew before expiry to avoid service interruption.';
      bannerColor = '#EAB308'; // Yellow
      bannerBg = '#fefce8';
      break;
    case '1_day':
      title = 'Critical: Subscription Expires Tomorrow';
      subtitle = `Your server subscription for ${service.service_name} expires tomorrow!`;
      actionText = 'Failure to renew will result in temporary suspension of your services.';
      bannerColor = '#F97316'; // Orange
      bannerBg = '#fff7ed';
      break;
    case '0_days':
      title = 'Subscription Expired - Grace Period Started';
      subtitle = `Your server subscription for ${service.service_name} has expired.`;
      actionText = 'You have entered the grace period. Your server is still active, but please renew immediately to avoid suspension.';
      bannerColor = '#EF4444'; // Red
      bannerBg = '#fef2f2';
      break;
    case 'grace_warning':
      title = 'Grace Period Ending Soon';
      subtitle = `Your grace period for ${service.service_name} is ending.`;
      actionText = `Please renew immediately. If payment is not received, your server will be suspended. Data will be preserved.`;
      bannerColor = '#EF4444'; 
      bannerBg = '#fef2f2';
      break;
    case 'suspended':
      title = 'Server Suspended';
      subtitle = `Your server ${service.service_name} has been suspended due to non-payment.`;
      actionText = 'All your data has been safely preserved. Complete payment to instantly restore your services.';
      bannerColor = '#94A3B8'; // Slate
      bannerBg = '#f8fafc';
      break;
    case 'reactivated':
      title = 'Payment Successful - Server Reactivated';
      subtitle = `Your payment was received and ${service.service_name} is now ACTIVE.`;
      actionText = 'Your server access has been fully restored. Thank you for choosing GreenLeaf Data Center.';
      bannerColor = '#22C55E';
      bannerBg = '#f0fdf4';
      actionButtonLabel = 'View Dashboard';
      break;
    default:
      title = 'Subscription Update';
      subtitle = `Update regarding your server: ${service.service_name}`;
      actionText = 'Please log in to your dashboard to view details.';
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 40px 0; }
        .main { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .header { background-color: #0B1220; padding: 32px 40px; text-align: left; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0; color: #94a3b8; font-size: 15px; line-height: 1.5; }
        .content { padding: 40px; }
        .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
        .info-grid { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
        .info-grid td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        .info-label { width: 35%; color: #64748b; font-size: 14px; font-weight: 500; }
        .info-value { width: 65%; color: #0f172a; font-size: 15px; font-weight: 600; }
        .action-card { background-color: ${bannerBg}; border-left: 4px solid ${bannerColor}; padding: 24px; border-radius: 0 8px 8px 0; margin-bottom: 16px; }
        .action-text { margin: 0 0 16px; color: #334155; font-size: 15px; font-weight: 500; line-height: 1.5; }
        .btn { display: inline-block; background-color: #2563EB; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; transition: background-color 0.2s; }
        .btn:hover { background-color: #1D4ED8; }
        .footer { padding: 32px 40px; background-color: #0f172a; text-align: center; }
        .footer-brand { color: #ffffff; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
        .footer-tagline { color: #22C55E; font-size: 13px; font-weight: 500; margin-bottom: 24px; letter-spacing: 0.5px; }
        .footer-text { color: #64748b; font-size: 12px; line-height: 1.5; margin: 0; }
        .divider { height: 1px; background-color: #1e293b; margin: 24px 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="main">
          <div class="header">
            <h1>${title}</h1>
            <p>Dear ${user.name},</p>
          </div>
          <div class="content">
            <div class="section-title">Subscription Details</div>
            <table class="info-grid">
              <tr>
                <td class="info-label">Server Name</td>
                <td class="info-value">${service.service_name}</td>
              </tr>
              <tr>
                <td class="info-label">Subscription ID</td>
                <td class="info-value">#${service.id}</td>
              </tr>
              <tr>
                <td class="info-label">Plan / Type</td>
                <td class="info-value">${service.service_type}</td>
              </tr>
              <tr>
                <td class="info-label">Monthly Amount</td>
                <td class="info-value">₹${service.monthly_amount}</td>
              </tr>
              <tr>
                <td class="info-label">Expiry Date</td>
                <td class="info-value" style="font-weight: 700; color: ${bannerColor};">${expiryDate}</td>
              </tr>
              ${stage !== 'suspended' && stage !== 'reactivated' ? `
              <tr>
                <td class="info-label">Remaining</td>
                <td class="info-value">${daysRemaining} Days</td>
              </tr>` : ''}
              <tr>
                <td class="info-label">Current Status</td>
                <td class="info-value">
                  <span style="background-color: #e2e8f0; padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: 600; text-transform: capitalize; color: #475569;">
                    ${service.status}
                  </span>
                </td>
              </tr>
            </table>

            <div class="action-card">
              <p class="action-text"><strong>${subtitle}</strong><br/>${actionText}</p>
              <a href="${actionLink}" class="btn" style="background-color: ${bannerColor};">${actionButtonLabel}</a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 24px;">
              If you need any assistance, please contact our support team.
            </p>
          </div>
          <div class="footer">
            <div class="footer-brand">GreenLeaf Data Center</div>
            <div class="footer-tagline">Enterprise Cloud &bull; AI Servers &bull; Colocation</div>
            <div class="divider"></div>
            <p class="footer-text">This is an automated notification. Please do not reply.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `
GreenLeaf Data Center | ${title}
======================================================
Dear ${user.name},

${subtitle}
${actionText}

--- Subscription Details ---
Server Name: ${service.service_name}
Subscription ID: #${service.id}
Plan: ${service.service_type}
Expiry Date: ${expiryDate}
Current Status: ${service.status}

------------------------------------------------------
Please log in to your dashboard to take action:
${actionLink}

======================================================
GreenLeaf Data Center
Enterprise Cloud • AI Servers • Colocation
  `;
  
  return { subject: `GreenLeaf Data Center | ${title}`, htmlContent, textContent };
};

/**
 * Orchestrates sending a notification (Email + DB).
 * Prevents duplicates by checking the metadata.
 */
export const dispatchLifecycleNotification = async (user, service, stage, daysRemaining) => {
  try {
    // 1. Check idempotency (prevent duplicates)
    const existingNotification = await Notification.findOne({
      where: {
        user_id: user.id,
        'metadata.service_id': service.id,
        'metadata.reminder_stage': stage,
        // Optional: you could check if it was sent in this specific billing cycle 
        // by storing the exact due date in metadata.
        'metadata.due_date': service.next_due_date.toISOString()
      }
    });

    if (existingNotification) {
      console.log(`[Notification Engine] Skipping duplicate ${stage} reminder for service ${service.id}`);
      return false; // Already sent
    }

    // 2. Generate content
    const { subject, htmlContent, textContent } = getEmailTemplate(user, service, stage, daysRemaining);
    
    // 3. Send Email
    let emailSent = false;
    if (user.email) {
      emailSent = await sendEmail(user.email, subject, htmlContent, textContent);
    }

    // 4. Create DB Notification
    const dbNotif = await Notification.create({
      user_id: user.id,
      title: subject,
      message: getEmailTemplate(user, service, stage, daysRemaining).textContent.split('---')[0].replace(/=/g,'').trim(),
      type: (stage === 'suspended' || stage === '0_days') ? 'error' : (stage === 'reactivated' ? 'success' : (stage === '7_days' || stage === '3_days' || stage === '1_day' ? 'warning' : 'info')),
      channels: { dashboard: true, email: emailSent, sms: false, whatsapp: false },
      metadata: {
        service_id: service.id,
        reminder_stage: stage,
        due_date: service.next_due_date,
        email_delivered: emailSent
      }
    });

    // 5. Log in AuditLog
    await AuditLog.create({
      action: 'Automated Notification Dispatched',
      target_user_id: user.id,
      entity_type: 'Service',
      entity_id: service.id,
      details: { stage, email_delivered: emailSent, notification_id: dbNotif.id }
    });

    console.log(`[Notification Engine] Dispatched ${stage} reminder for service ${service.id}`);
    return true;

  } catch (error) {
    console.error(`[Notification Engine] Error dispatching ${stage} for service ${service.id}:`, error);
    return false;
  }
};
