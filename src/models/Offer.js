import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Offer = sequelize.define('Offer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    discount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    min_vcpu: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    min_ram: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'offers',
    timestamps: true
});

export default Offer;
