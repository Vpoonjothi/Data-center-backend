import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { hashPassword } from '../utils/passwordHelper.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false, // Changed to false as Mobile Number is mandatory for registration
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'customer', 'sales'),
    defaultValue: 'customer',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  terms_accepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  terms_accepted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  risk_level: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'low',
  },
  risk_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // --- Personal Information ---
  alternate_mobile: { type: DataTypes.STRING, allowNull: true },
  designation: { type: DataTypes.STRING, allowNull: true },
  
  // --- Business Information ---
  company: { type: DataTypes.STRING, allowNull: true },
  business_type: { type: DataTypes.STRING, allowNull: true },
  gst_number: { type: DataTypes.STRING, allowNull: true },
  website: { type: DataTypes.STRING, allowNull: true },
  industry: { type: DataTypes.STRING, allowNull: true },
  
  // --- Address Information ---
  address_line1: { type: DataTypes.STRING, allowNull: true },
  address_line2: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  state: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },
  pin_code: { type: DataTypes.STRING, allowNull: true },
  
  // --- Service Information ---
  service_requirement_type: { type: DataTypes.STRING, allowNull: true },
  expected_deployment_date: { type: DataTypes.STRING, allowNull: true },
  monthly_budget_range: { type: DataTypes.STRING, allowNull: true },
  
  // --- KYC Information ---
  kyc_document_type: { type: DataTypes.STRING, allowNull: true },
  kyc_document_number: { type: DataTypes.STRING, allowNull: true },
  kyc_front_upload: { type: DataTypes.STRING, allowNull: true },
  kyc_back_upload: { type: DataTypes.STRING, allowNull: true },
  kyc_verification_status: { 
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await hashPassword(user.password);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await hashPassword(user.password);
      }
    },
  },
  defaultScope: {
    attributes: { exclude: ['password'] }
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] }
    }
  }
});

export default User;
