const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Workshop = sequelize.define('Workshop', {
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
  instructor: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  enrolled: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  category: {
    type: DataTypes.ENUM('Gardening', 'Cooking', 'Preservation', 'Sustainability', 'Other'),
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
}, {
  tableName: 'workshops',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  getterMethods: {
    coordinates() {
      const lat = this.coordLat != null ? parseFloat(this.coordLat) : null;
      const lng = this.coordLng != null ? parseFloat(this.coordLng) : null;
      return (lat != null && lng != null) ? { lat, lng } : null;
    },
  },
});

Workshop.prototype.toJSON = function () {
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

module.exports = Workshop;
