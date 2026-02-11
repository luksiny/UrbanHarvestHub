const path = require('path');
// Load .env from project root (parent of backend/) so password is always read
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });

const { Sequelize } = require('sequelize');
const fs = require('fs');

const DB_NAME = process.env.DB_NAME || 'urbanharvesthub';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

const options = {
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
  dialectOptions: {},
};

// SSL Configuration for Render/Cloud
// If the CA certificate file exists (from Render "Secret File"), use it.
const caPath = '/etc/secrets/ca.pem';
if (fs.existsSync(caPath)) {
  console.log('🔒 Using SSL Certificate from ' + caPath);
  options.dialectOptions.ssl = {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  };
} else if (process.env.NODE_ENV === 'production') {
  // Fallback for production if no specific cert file is found but SSL is expected
  // Some providers like TiDB or PlanetScale might need this
  console.log('⚠️ Production environment detected but no CA cert found at /etc/secrets/ca.pem. Using basic SSL.');
  options.dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false, // Set to true if you have the CA cert in an ENV variable
  };
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, options);

module.exports = sequelize;
