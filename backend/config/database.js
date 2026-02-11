const path = require('path');
// Load .env from project root (parent of backend/) so password is always read
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });

const { Sequelize } = require('sequelize');

const DB_NAME = process.env.DB_NAME || 'urbanharvesthub';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

module.exports = sequelize;
