import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Service = sequelize.define('Service', {
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
  service_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  service_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  monthly_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Active', 'Expired', 'Cancelled', 'Suspended'),
    defaultValue: 'Active',
  },
  purchase_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  next_due_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  renewal_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  renewal_type: {
    type: DataTypes.ENUM('manual', 'auto'),
    defaultValue: 'manual',
  },
}, {
  timestamps: true, // creates created_at and updated_at
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Service;
