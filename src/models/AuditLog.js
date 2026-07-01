import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  action: { type: DataTypes.STRING, allowNull: false },
  action_by_user_id: { type: DataTypes.INTEGER, allowNull: true },
  target_user_id: { type: DataTypes.INTEGER, allowNull: true },
  entity_type: { type: DataTypes.STRING, allowNull: true },
  entity_id: { type: DataTypes.INTEGER, allowNull: true },
  ip_address: { type: DataTypes.STRING, allowNull: true },
  browser_info: { type: DataTypes.STRING, allowNull: true },
  details: { type: DataTypes.JSON, allowNull: true },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default AuditLog;
