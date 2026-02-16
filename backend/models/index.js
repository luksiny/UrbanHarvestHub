const sequelize = require('../config/database');
const Workshop = require('./Workshop');
const Product = require('./Product');
const Event = require('./Event');
const Booking = require('./Booking');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Admin = require('./Admin');
const User = require('./User');
const Review = require('./Review');
const Subscription = require('./Subscription');

// Associations
Workshop.hasMany(Booking, { foreignKey: 'workshopId', as: 'Bookings' });
Booking.belongsTo(Workshop, { foreignKey: 'workshopId', as: 'Workshop' });

Booking.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasMany(Booking, { foreignKey: 'userId', as: 'Bookings' });

User.hasMany(Review, { foreignKey: 'userId', as: 'Reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'User' });

User.hasMany(Subscription, { foreignKey: 'userId', as: 'Subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'User' });

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
  User,
  Review,
  Subscription,
  syncDatabase,
};
