import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EnquiryNote = sequelize.define('EnquiryNote', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  enquiry_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  note_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'enquiry_notes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default EnquiryNote;
