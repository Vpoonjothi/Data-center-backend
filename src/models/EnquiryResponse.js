import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EnquiryResponse = sequelize.define('EnquiryResponse', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  enquiry_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'enquiry_responses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default EnquiryResponse;
