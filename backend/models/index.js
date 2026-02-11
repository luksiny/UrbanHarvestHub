const sequelize = require('../config/database');
const Workshop = require('./Workshop');
const Product = require('./Product');
const Event = require('./Event');
const Booking = require('./Booking');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Admin = require('./Admin');

// Associations (foreignKey is the attribute name on Booking; column is workshop_id)
Booking.belongsTo(Workshop, { foreignKey: 'workshopId', as: 'Workshop' });
Workshop.hasMany(Booking, { foreignKey: 'workshopId', as: 'Bookings' });

// Order <-> OrderItem <-> Product (foreign key constraints for fully relational orders)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'OrderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'Order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'OrderItems' });

async function syncDatabase(options = {}) {
  await sequelize.sync(options);
}

module.exports = {
  sequelize,
  Workshop,
  Product,
  Event,
  Booking,
  Order,
  OrderItem,
  Admin,
  syncDatabase,
};
