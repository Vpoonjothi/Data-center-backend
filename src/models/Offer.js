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
    },
    product_category: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Enterprise Servers'
    },
    status: {
        type: DataTypes.ENUM('Active', 'Scheduled', 'Expired', 'Draft'),
        allowNull: false,
        defaultValue: 'Draft'
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'offers',
    timestamps: true
});

export default Offer;
