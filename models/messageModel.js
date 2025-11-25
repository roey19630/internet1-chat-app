const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('./userModel');

// Defining the Message model
const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    edited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Default value
    },
    deleted: {
        type: DataTypes.BOOLEAN, // Soft delete column
        allowNull: false,
        defaultValue: false, // Messages start as non-deleted
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
});

module.exports = { Message };
