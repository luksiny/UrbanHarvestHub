const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  workshopId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'workshops', key: 'id' },
    onDelete: 'CASCADE',
    field: 'workshop_id',
  },
  userId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'user_id',
  },
  userName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'user_name',
  },
  userEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'user_email',
  },
  userPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'user_phone',
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
    defaultValue: 'confirmed',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

Booking.prototype.toJSON = function () {
  const values = { ...this.get({ plain: true }) };
  values._id = values.id;
  values.workshopId = values.workshop_id ?? values.workshopId;
  values.userId = values.user_id ?? values.userId;
  values.userName = values.user_name ?? values.userName;
  values.userEmail = values.user_email ?? values.userEmail;
  values.userPhone = values.user_phone ?? values.userPhone;
  delete values.workshop_id;
  delete values.user_id;
  delete values.user_name;
  delete values.user_email;
  delete values.user_phone;
  return values;
};

module.exports = Booking;
