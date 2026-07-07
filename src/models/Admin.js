import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { hashPassword } from '../utils/passwordHelper.js';

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'admin',
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  avatar: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  email_notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  website_notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  browser_notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'admins',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.password) {
        admin.password = await hashPassword(admin.password);
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('password')) {
        admin.password = await hashPassword(admin.password);
      }
    },
  },
  defaultScope: {
    attributes: { exclude: ['password'] }
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] }
    }
  }
});

export default Admin;
