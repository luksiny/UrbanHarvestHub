-- =============================================================================
-- Add Foreign Key constraints to order_items (essential for Database Integration)
-- =============================================================================
-- Database: urbanharvesthub (or your DB_NAME from .env)
-- Run in MySQL: mysql -u root -p urbanharvesthub < add-order-items-foreign-keys.sql
-- Or run each ALTER TABLE in MySQL Workbench / phpMyAdmin.
-- =============================================================================

-- STEP 1 (only if your columns are still camelCase): rename to snake_case
-- ALTER TABLE order_items CHANGE COLUMN orderId order_id INT NOT NULL;
-- ALTER TABLE order_items CHANGE COLUMN productId product_id INT NOT NULL;

-- STEP 2: Add Foreign Key - order_id references orders(id)
ALTER TABLE order_items
  ADD CONSTRAINT fk_order_items_order
  FOREIGN KEY (order_id) REFERENCES orders(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- STEP 3: Add Foreign Key - product_id references products(id)
ALTER TABLE order_items
  ADD CONSTRAINT fk_order_items_product
  FOREIGN KEY (product_id) REFERENCES products(id)
  ON DELETE RESTRICT ON UPDATE CASCADE;
