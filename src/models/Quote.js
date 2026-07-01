import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Quote = sequelize.define('Quote', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  quote_number: {
    type: DataTypes.STRING,
    unique: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  enquiry_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  service_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Custom Server',
  },
  vcpu: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ram: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  storage: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  os: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bandwidth: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  backup: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  discount: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  monthly_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'quoted', 'verification_pending', 'verified', 'processing', 'paid', 'active', 'rejected'),
    defaultValue: 'pending',
  },
  duration_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  duration_value: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  duration_unit: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subtotal_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  gst_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  grand_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  reject_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  renewal_type: {
    type: DataTypes.ENUM('manual', 'auto'),
    defaultValue: 'manual',
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (quote) => {
      // Generate a unique quote number (e.g., QT-000001)
      const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      quote.quote_number = `QT-${randomPart}`;
    }
  }
});

export default Quote;
