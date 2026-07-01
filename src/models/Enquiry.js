import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Enquiry = sequelize.define('Enquiry', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('contact', 'quote', 'ai_server', 'enterprise_server', 'colocation'),
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be null if it's a guest enquiry
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  configuration_json: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('New', 'In Progress', 'Responded', 'Quoted', 'Verification Pending', 'Verified', 'Paid', 'Active', 'Closed'),
    defaultValue: 'New',
  },
}, {
  tableName: 'enquiries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default Enquiry;
