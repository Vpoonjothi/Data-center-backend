import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CustomerTimeline = sequelize.define('CustomerTimeline', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  admin_id: { type: DataTypes.INTEGER, allowNull: true },
  event_type: { type: DataTypes.STRING, allowNull: false },
  event_title: { type: DataTypes.STRING, allowNull: false },
  event_description: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'customer_timelines',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default CustomerTimeline;
