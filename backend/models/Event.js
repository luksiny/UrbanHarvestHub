const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date',
  },
  location: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  coordLat: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
    field: 'coord_lat',
  },
  coordLng: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
    field: 'coord_lng',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  registered: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  category: {
    type: DataTypes.ENUM('Harvest Festival', 'Farmers Market', 'Community Garden', 'Educational', 'Social', 'Other'),
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  organizer: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'events',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

Event.prototype.toJSON = function () {
  const values = { ...this.get({ plain: true }) };
  values._id = values.id;
  if (values.coordLat != null || values.coordLng != null) {
    values.coordinates = {
      lat: values.coordLat != null ? parseFloat(values.coordLat) : null,
      lng: values.coordLng != null ? parseFloat(values.coordLng) : null,
    };
  }
  delete values.coordLat;
  delete values.coordLng;
  return values;
};

module.exports = Event;
