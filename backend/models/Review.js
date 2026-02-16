const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    targetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    targetType: {
        type: DataTypes.ENUM('Product', 'Workshop', 'Event'),
        allowNull: false,
    }
}, {
    tableName: 'reviews',
    timestamps: true,
});

Review.prototype.toJSON = function () {
    const values = { ...this.get({ plain: true }) };
    values._id = values.id;
    return values;
};

module.exports = Review;
