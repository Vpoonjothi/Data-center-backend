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
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
  },
  taxable_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  gst_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 18.00,
    allowNull: false,
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
      const year = new Date().getFullYear();
      const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      quote.quote_number = `QT-${randomPart}-${year}`;
    }
  }
});

export default Quote;
