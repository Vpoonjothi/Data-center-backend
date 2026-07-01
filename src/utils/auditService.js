import { AuditLog, CustomerTimeline, Notification } from '../models/index.js';
import { sendEmail } from './emailService.js';

export const logAudit = async ({ action, action_by_user_id, target_user_id, entity_type, entity_id, req, details }) => {
  try {
    const ip_address = req?.ip || req?.headers['x-forwarded-for'] || null;
    const browser_info = req?.headers['user-agent'] || null;

    await AuditLog.create({
      action,
      action_by_user_id,
      target_user_id,
      entity_type,
      entity_id,
      ip_address,
      browser_info,
      details
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

export const logTimeline = async ({ user_id, admin_id, event_type, event_title, event_description }) => {
  try {
    await CustomerTimeline.create({
      user_id,
      admin_id,
      event_type,
      event_title,
      event_description
    });
  } catch (error) {
    console.error('Timeline Log Error:', error);
  }
};

export const sendNotification = async ({ user_id, title, message, type, channels = { dashboard: true, email: true }, email_address = null }) => {
  try {
    await Notification.create({
      user_id,
      title,
      message,
      type,
      channels
    });

    if (channels.email && email_address) {
      await sendEmail(email_address, title, message);
    }
  } catch (error) {
    console.error('Notification Error:', error);
  }
};
