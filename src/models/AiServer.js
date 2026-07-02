import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AiServer = sequelize.define('AiServer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    monthly_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cpu: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ram: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    storage: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gpu: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    network: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    support: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    tableName: 'ai_servers',
    timestamps: true
});

export default AiServer;
