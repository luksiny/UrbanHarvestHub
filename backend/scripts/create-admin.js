/**
 * Create the default admin user only (no other seed data).
 * Run from project root: node backend/scripts/create-admin.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });
const { Admin, sequelize } = require('../models');

const DEFAULT_EMAIL = 'admin@urbanharvesthub.com';
const DEFAULT_PASSWORD = 'Admin123!';
const DEFAULT_NAME = 'Admin';

async function run() {
  try {
    await sequelize.authenticate();
    const existing = await Admin.findOne({ where: { email: DEFAULT_EMAIL } });
    if (existing) {
      console.log('Default admin already exists:', DEFAULT_EMAIL);
      return;
    }
    await Admin.create({
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
      name: DEFAULT_NAME,
    });
    console.log('Default admin created successfully.');
    console.log('  Email:', DEFAULT_EMAIL);
    console.log('  Password:', DEFAULT_PASSWORD);
  } catch (err) {
    console.error('Error:', err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
