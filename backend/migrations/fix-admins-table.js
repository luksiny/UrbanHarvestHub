/**
 * Fix admins table: ensure it has id, email, password, name, createdAt, updatedAt.
 * Run from project root: node backend/migrations/fix-admins-table.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });
const { sequelize } = require('../models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');
    await sequelize.query('DROP TABLE IF EXISTS admins');
    await sequelize.query(`
      CREATE TABLE admins (
        id INT NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY admins_email_unique (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('admins table recreated with correct schema (id, email, password, name, createdAt, updatedAt).');
    console.log('Run "npm run seed" to create the default admin (admin@urbanharvesthub.com / Admin123!).');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
