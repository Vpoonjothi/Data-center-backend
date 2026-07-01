import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Document = sequelize.define('Document', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  entity_type: { type: DataTypes.STRING, allowNull: false }, // 'KycVerification', 'Payment', 'Quote'
  entity_id: { type: DataTypes.INTEGER, allowNull: false },
  document_type: { type: DataTypes.STRING, allowNull: false }, // 'aadhaar_front', 'gst_cert', 'payment_receipt'
  file_path: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('active', 'rejected', 'archived'), defaultValue: 'active' },
  remarks: { type: DataTypes.TEXT, allowNull: true },
  version_group_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
  version_number: { type: DataTypes.INTEGER, defaultValue: 1 },
}, {
  tableName: 'documents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Document;
