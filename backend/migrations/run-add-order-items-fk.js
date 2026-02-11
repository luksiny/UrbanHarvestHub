/**
 * One-off migration: add Foreign Key constraints to order_items.
 * Links order_id -> orders(id) and product_id -> products(id).
 * Run from backend folder: node migrations/run-add-order-items-fk.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });
const sequelize = require('../config/database');
// Load models so order_items table can be created by sync and FKs match
require('../models');

const SQL = {
  // Optional: only if columns are still camelCase (orderId, productId)
  renameOrderId: "ALTER TABLE order_items CHANGE COLUMN orderId order_id INT NOT NULL",
  renameProductId: "ALTER TABLE order_items CHANGE COLUMN productId product_id INT NOT NULL",
  addFkOrder: `ALTER TABLE order_items
    ADD CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE`,
  addFkProduct: `ALTER TABLE order_items
    ADD CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT ON UPDATE CASCADE`,
};

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Ensure order_items (and orders, products) exist
    const { syncDatabase } = require('../models');
    await syncDatabase();
    console.log('Tables synced.');

    // Try to add FKs (columns should be order_id, product_id if model used field:)
    try {
      await sequelize.query(SQL.addFkOrder);
      console.log('Added FK: order_id -> orders(id)');
    } catch (e) {
      if (e.name === 'SequelizeDatabaseError' && e.original?.code === 'ER_DUP_KEYNAME') {
        console.log('FK fk_order_items_order already exists, skipping.');
      } else if (e.original?.message?.includes("Unknown column 'order_id'")) {
        console.log('Renaming orderId -> order_id...');
        await sequelize.query(SQL.renameOrderId);
        await sequelize.query(SQL.addFkOrder);
        console.log('Added FK: order_id -> orders(id)');
      } else throw e;
    }

    try {
      await sequelize.query(SQL.addFkProduct);
      console.log('Added FK: product_id -> products(id)');
    } catch (e) {
      if (e.name === 'SequelizeDatabaseError' && e.original?.code === 'ER_DUP_KEYNAME') {
        console.log('FK fk_order_items_product already exists, skipping.');
      } else if (e.original?.message?.includes("Unknown column 'product_id'")) {
        console.log('Renaming productId -> product_id...');
        await sequelize.query(SQL.renameProductId);
        await sequelize.query(SQL.addFkProduct);
        console.log('Added FK: product_id -> products(id)');
      } else throw e;
    }

    console.log('Migration complete. order_items now has FK constraints for Database Integration.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    if (err.original) console.error(err.original.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
