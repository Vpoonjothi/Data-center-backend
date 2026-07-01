import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EnquiryLog = sequelize.define('EnquiryLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  enquiry_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Null means system action, otherwise admin who did it
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'enquiry_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default EnquiryLog;
