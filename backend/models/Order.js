const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array of { productId, name, price, quantity, unit }',
  },
  shipping: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Shipping address and contact',
  },
  payment: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Mock payment info { method, last4 }',
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

Order.prototype.toJSON = function () {
  const values = { ...this.get({ plain: true }) };
  values._id = values.id;
  if (typeof values.total === 'string') values.total = parseFloat(values.total);
  return values;
};

module.exports = Order;
