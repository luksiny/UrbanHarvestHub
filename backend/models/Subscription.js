const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    boxType: {
        type: DataTypes.ENUM('Weekly Veggie', 'Fruit Delight', 'Chef Special', 'Organic Starter'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('active', 'paused', 'cancelled'),
        defaultValue: 'active',
    },
    frequency: {
        type: DataTypes.ENUM('weekly', 'bi-weekly', 'monthly'),
        defaultValue: 'weekly',
    },
    startDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
}, {
    tableName: 'subscriptions',
    timestamps: true,
});

Subscription.prototype.toJSON = function () {
    const values = { ...this.get({ plain: true }) };
    values._id = values.id;
    return values;
};

module.exports = Subscription;
