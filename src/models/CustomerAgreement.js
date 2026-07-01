import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CustomerAgreement = sequelize.define('CustomerAgreement', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  quote_id: { type: DataTypes.INTEGER, allowNull: false },
  msa_accepted: { type: DataTypes.BOOLEAN, defaultValue: false },
  tnc_accepted: { type: DataTypes.BOOLEAN, defaultValue: false },
  aup_accepted: { type: DataTypes.BOOLEAN, defaultValue: false },
  privacy_accepted: { type: DataTypes.BOOLEAN, defaultValue: false },
  ip_address: { type: DataTypes.STRING, allowNull: true },
  browser_info: { type: DataTypes.STRING, allowNull: true },
  accepted_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'customer_agreements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default CustomerAgreement;
