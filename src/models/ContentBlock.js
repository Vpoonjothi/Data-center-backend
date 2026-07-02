import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ContentBlock = sequelize.define('ContentBlock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    type: {
        type: DataTypes.ENUM('text', 'html', 'image_url'),
        defaultValue: 'text',
        allowNull: false,
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, {
    tableName: 'content_blocks',
    timestamps: true
});

export default ContentBlock;
