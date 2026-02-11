const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('Vegetables', 'Fruits', 'Herbs', 'Seeds', 'Tools', 'Other'),
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  unit: {
    type: DataTypes.ENUM('piece', 'kg', 'lb', 'bunch', 'pack'),
    defaultValue: 'piece',
  },
  organic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  seller: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

Product.prototype.toJSON = function () {
  const values = { ...this.get({ plain: true }) };
  values._id = values.id;
  if (typeof values.price === 'string') values.price = parseFloat(values.price);
  return values;
};

module.exports = Product;
