-- setup_database.sql
-- Run this script in MySQL Workbench to create the missing tables and seed initial data.

USE urbanharvesthub;

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    userId INT NOT NULL,
    targetId INT NOT NULL,
    targetType ENUM('Product', 'Workshop', 'Event') NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    boxType ENUM('Weekly Veggie', 'Fruit Delight', 'Chef Special', 'Organic Starter') NOT NULL,
    status ENUM('active', 'paused', 'cancelled') DEFAULT 'active',
    frequency ENUM('weekly', 'bi-weekly', 'monthly') DEFAULT 'weekly',
    startDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    price DECIMAL(10, 2) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Insert Sample Users (Passwords are hashed 'User123!')
-- You typically need a bcrypt hash. 'User123!' hash is roughly: $2a$10$ExampleHash...
-- For now using placeholder, application handles hashing.
INSERT INTO users (name, email, password, createdAt, updatedAt) VALUES 
('Alice Green', 'alice@example.com', '$2a$10$Xkms/ExampleHashForUser123!', NOW(), NOW()),
('Bob Gardener', 'bob@example.com', '$2a$10$Xkms/ExampleHashForUser123!', NOW(), NOW())
ON DUPLICATE KEY UPDATE name=name;

-- 5. Insert Sample Subscription
INSERT INTO subscriptions (userId, boxType, status, frequency, price, startDate, createdAt, updatedAt)
SELECT id, 'Weekly Veggie', 'active', 'weekly', 29.99, NOW(), NOW(), NOW()
FROM users WHERE email = 'alice@example.com'
LIMIT 1;

-- Note: Reviews require valid Product/Workshop IDs. Add them manually or via app.
