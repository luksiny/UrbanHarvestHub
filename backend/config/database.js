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

console.log('Database Configuration:');
console.log(`  Host: ${DB_HOST}`);
console.log(`  Port: ${DB_PORT}`);
console.log(`  User: ${DB_USER}`);
console.log(`  Database: ${DB_NAME}`);
console.log(`  SSL Enabled: ${process.env.NODE_ENV === 'production' || (DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1')}`);

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
    rejectUnauthorized: false,
  };
} else if (process.env.NODE_ENV === 'production' || (DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1')) {
  // Fallback for production or remote dev (e.g. Aiven)
  console.log('⚠️ Remote database detected. Using basic SSL.');
  options.dialectOptions.ssl = {
    rejectUnauthorized: false,
  };
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, options);

module.exports = sequelize;
