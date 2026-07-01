import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const VerificationRequest = sequelize.define('VerificationRequest', {
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
  document_type: {
    type: DataTypes.ENUM('Aadhaar', 'PAN', 'Passport', 'Driving License', 'GST Certificate'),
    defaultValue: 'Aadhaar',
  },
  document_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  aadhaar_front_path: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  aadhaar_back_path: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('verification_pending', 'verified', 'rejected', 'reupload_required'),
    defaultValue: 'verification_pending',
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true,
  createdAt: 'submitted_at',
  updatedAt: false,
});

export default VerificationRequest;
