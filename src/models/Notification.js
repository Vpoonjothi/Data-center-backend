import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('info', 'success', 'warning', 'error'), defaultValue: 'info' },
  channels: { 
    type: DataTypes.JSON, 
    defaultValue: { dashboard: true, email: false, sms: false, whatsapp: false }
  },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Notification;
