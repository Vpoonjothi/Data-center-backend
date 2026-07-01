import User from './User.js';
import Quote from './Quote.js';
import Admin from './Admin.js';
import Enquiry from './Enquiry.js';
import EnquiryResponse from './EnquiryResponse.js';
import EnquiryNote from './EnquiryNote.js';
import EnquiryLog from './EnquiryLog.js';
import VerificationRequest from './VerificationRequest.js';
import Payment from './Payment.js';
import Service from './Service.js';
import KycVerification from './KycVerification.js';
import AuditLog from './AuditLog.js';
import Document from './Document.js';
import CustomerAgreement from './CustomerAgreement.js';
import CustomerTimeline from './CustomerTimeline.js';
import Notification from './Notification.js';

// Existing Associations
User.hasMany(Quote, { foreignKey: 'user_id', as: 'quotes' });
Quote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// New Associations
User.hasMany(Enquiry, { foreignKey: 'user_id', as: 'enquiries' });
Enquiry.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Enquiry.hasMany(EnquiryResponse, { foreignKey: 'enquiry_id', as: 'responses' });
EnquiryResponse.belongsTo(Enquiry, { foreignKey: 'enquiry_id', as: 'enquiry' });

Admin.hasMany(EnquiryResponse, { foreignKey: 'admin_id', as: 'responses' });
EnquiryResponse.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });

Enquiry.hasMany(EnquiryNote, { foreignKey: 'enquiry_id', as: 'notes' });
EnquiryNote.belongsTo(Enquiry, { foreignKey: 'enquiry_id', as: 'enquiry' });
EnquiryNote.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });

Enquiry.hasMany(EnquiryLog, { foreignKey: 'enquiry_id', as: 'logs' });
EnquiryLog.belongsTo(Enquiry, { foreignKey: 'enquiry_id', as: 'enquiry' });

Enquiry.hasMany(Quote, { foreignKey: 'enquiry_id', as: 'quotes' });
Quote.belongsTo(Enquiry, { foreignKey: 'enquiry_id', as: 'enquiry' });

// Verification Associations
User.hasMany(VerificationRequest, { foreignKey: 'user_id' });
VerificationRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Quote.hasOne(VerificationRequest, { foreignKey: 'quote_id' });
VerificationRequest.belongsTo(Quote, { foreignKey: 'quote_id', as: 'quote' });

// KycVerification Associations
User.hasMany(KycVerification, { foreignKey: 'user_id', as: 'kyc_verifications' });
KycVerification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Quote.hasOne(KycVerification, { foreignKey: 'quote_id' });
KycVerification.belongsTo(Quote, { foreignKey: 'quote_id', as: 'quote' });

// Service Associations
User.hasMany(Service, { foreignKey: 'user_id', as: 'services' });
Service.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Quote.hasOne(Service, { foreignKey: 'quote_id', as: 'service' });
Service.belongsTo(Quote, { foreignKey: 'quote_id', as: 'quote' });

// Payment Associations
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Quote.hasMany(Payment, { foreignKey: 'quote_id', as: 'payments' });
Payment.belongsTo(Quote, { foreignKey: 'quote_id', as: 'quote' });

Service.hasMany(Payment, { foreignKey: 'service_id', as: 'payments' });
Payment.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

// AuditLog Associations
User.hasMany(AuditLog, { foreignKey: 'action_by_user_id', as: 'performed_actions' });
AuditLog.belongsTo(User, { foreignKey: 'action_by_user_id', as: 'action_by' });
User.hasMany(AuditLog, { foreignKey: 'target_user_id', as: 'audit_logs' });
AuditLog.belongsTo(User, { foreignKey: 'target_user_id', as: 'target_user' });

// Document Associations
User.hasMany(Document, { foreignKey: 'user_id', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// CustomerAgreement Associations
User.hasMany(CustomerAgreement, { foreignKey: 'user_id', as: 'agreements' });
CustomerAgreement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Quote.hasOne(CustomerAgreement, { foreignKey: 'quote_id', as: 'agreement' });
CustomerAgreement.belongsTo(Quote, { foreignKey: 'quote_id', as: 'quote' });

// CustomerTimeline Associations
User.hasMany(CustomerTimeline, { foreignKey: 'user_id', as: 'timeline_events' });
CustomerTimeline.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Notification Associations
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  User,
  Quote,
  Admin,
  Enquiry,
  EnquiryResponse,
  EnquiryNote,
  EnquiryLog,
  VerificationRequest,
  Payment,
  Service,
  KycVerification,
  AuditLog,
  Document,
  CustomerAgreement,
  CustomerTimeline,
  Notification
};
