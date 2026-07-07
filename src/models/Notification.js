import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  admin_id: { type: DataTypes.INTEGER, allowNull: true },
  user_type: { type: DataTypes.ENUM('admin', 'customer'), allowNull: false, defaultValue: 'customer' },
  category: { 
    type: DataTypes.STRING, 
    defaultValue: 'System' // Account, Sales Requests, Quotes, Orders, Payments, KYC, Verification, Services, Support, Messages, Security, System
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'low'
  },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  related_module: { type: DataTypes.STRING, allowNull: true },
  related_record_id: { type: DataTypes.INTEGER, allowNull: true },
  action_url: { type: DataTypes.STRING, allowNull: true },
  type: { type: DataTypes.ENUM('info', 'success', 'warning', 'error'), defaultValue: 'info' }, // Legacy type for backwards compatibility
  channels: { 
    type: DataTypes.JSON, 
    defaultValue: { dashboard: true, email: false, browser: false, sms: false, whatsapp: false }
  },
  metadata: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  read_at: { type: DataTypes.DATE, allowNull: true },
  email_sent: { type: DataTypes.BOOLEAN, defaultValue: false },
  email_sent_at: { type: DataTypes.DATE, allowNull: true },
  sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['admin_id'] },
    { fields: ['created_at'] },
    { fields: ['is_read'] }
  ]
});

export default Notification;
