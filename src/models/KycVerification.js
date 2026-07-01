import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const KycVerification = sequelize.define('KycVerification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quote_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  aadhaar_status: {
    type: DataTypes.ENUM('pending', 'verified', 'failed'),
    defaultValue: 'pending',
  },
  pan_status: {
    type: DataTypes.ENUM('pending', 'verified', 'failed'),
    defaultValue: 'pending',
  },
  overall_status: {
    type: DataTypes.ENUM('pending', 'under_review', 'partially_verified', 'verified', 'rejected', 'failed'),
    defaultValue: 'pending',
  },
  aadhaar_reference_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pan_reference_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  kyc_consent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  kyc_consent_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verification_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  renewal_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // -- NEW FIELDS ADDED VIA MIGRATION --
  customer_type: {
    type: DataTypes.ENUM('individual', 'company'),
    defaultValue: 'individual'
  },
  // Individual & General
  full_name: { type: DataTypes.STRING, allowNull: true },
  email_address: { type: DataTypes.STRING, allowNull: true },
  mobile_number: { type: DataTypes.STRING, allowNull: true },
  residential_address: { type: DataTypes.TEXT, allowNull: true },
  aadhaar_number: { type: DataTypes.STRING, allowNull: true },
  // Company
  company_name: { type: DataTypes.STRING, allowNull: true },
  gst_number: { type: DataTypes.STRING, allowNull: true },
  pan_number: { type: DataTypes.STRING, allowNull: true },
  registered_address: { type: DataTypes.TEXT, allowNull: true },
  auth_contact_person: { type: DataTypes.STRING, allowNull: true },
  designation: { type: DataTypes.STRING, allowNull: true },
  official_email: { type: DataTypes.STRING, allowNull: true },
  auth_aadhaar_number: { type: DataTypes.STRING, allowNull: true },
  // File Paths
  aadhaar_front_path: { type: DataTypes.STRING, allowNull: true },
  aadhaar_front_status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'replaced'), defaultValue: 'pending' },
  aadhaar_front_reason: { type: DataTypes.TEXT, allowNull: true },

  aadhaar_back_path: { type: DataTypes.STRING, allowNull: true },
  aadhaar_back_status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'replaced'), defaultValue: 'pending' },
  aadhaar_back_reason: { type: DataTypes.TEXT, allowNull: true },

  gst_cert_path: { type: DataTypes.STRING, allowNull: true },
  gst_cert_status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'replaced'), defaultValue: 'pending' },
  gst_cert_reason: { type: DataTypes.TEXT, allowNull: true },

  pan_card_path: { type: DataTypes.STRING, allowNull: true },
  pan_card_status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'replaced'), defaultValue: 'pending' },
  pan_card_reason: { type: DataTypes.TEXT, allowNull: true },

  company_reg_path: { type: DataTypes.STRING, allowNull: true },
  company_reg_status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'replaced'), defaultValue: 'pending' },
  company_reg_reason: { type: DataTypes.TEXT, allowNull: true },

  address_proof_path: { type: DataTypes.STRING, allowNull: true },
  address_proof_status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'replaced'), defaultValue: 'pending' },
  address_proof_reason: { type: DataTypes.TEXT, allowNull: true },
  // Admin & Audit
  internal_remarks: { type: DataTypes.TEXT, allowNull: true },
  reject_reason: { type: DataTypes.TEXT, allowNull: true },
  verification_comments: { type: DataTypes.TEXT, allowNull: true },
  expires_at: { type: DataTypes.DATE, allowNull: true },
  submitted_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'kyc_verifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default KycVerification;
