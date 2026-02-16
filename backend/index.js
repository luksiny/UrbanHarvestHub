const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

let sequelize, syncDatabase;
let modelsLoadError = null;
try {
  const models = require('./models');
  sequelize = models.sequelize;
  syncDatabase = models.syncDatabase;
} catch (err) {
  modelsLoadError = err;
  console.error('❌ Failed to load models:', err.message);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);
  console.error('   Run: npm install   and ensure MySQL is set up. See MYSQL_SETUP.md');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (always available)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Urban Harvest Hub API is running' });
});

if (sequelize && syncDatabase) {
  sequelize.authenticate()
    .then(() => {
      console.log('✅ MySQL Connected');
      // Changed alter: true to alter: false to prevent Sequelize from creating redundant indexes
      // which causes the "Too many keys" error (MySQL limit: 64).
      // If you change your model fields, set this to true temporarily then back to false.
      return syncDatabase({ alter: false });
    })
    .then(() => console.log('✅ Database tables synced'))
    .catch(err => {
      console.error('❌ Database Error:', err.message);
      console.error('   Server will still run; API calls may fail until MySQL is connected.');
    });

  try {
    app.use('/api/workshops', require('./routes/workshops'));
    app.use('/api/products', require('./routes/products'));
    app.use('/api/events', require('./routes/events'));
    app.use('/api/bookings', require('./routes/bookings'));
    app.use('/api/orders', require('./routes/orders'));
    app.use('/api/admin', require('./routes/admin'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/reviews', require('./routes/reviews'));
    app.use('/api/subscriptions', require('./routes/subscriptions'));
    app.use('/api/seed', require('./routes/seed'));
  } catch (routeErr) {
    console.error('❌ Failed to load routes:', routeErr.message);
    app.use('/api', (req, res, next) => {
      if (req.path === '/health') return next();
      res.status(503).json({
        success: false,
        message: 'API routes not loaded. Check the error above.',
      });
    });
  }
} else {
  app.use('/api', (req, res, next) => {
    if (req.path === '/health') return next();
    const msg = modelsLoadError
      ? `Backend not ready: ${modelsLoadError.message}`
      : 'Backend not ready. Run npm install and ensure MySQL is running. See MYSQL_SETUP.md';
    res.status(503).json({
      success: false,
      message: msg,
      ...(process.env.NODE_ENV !== 'production' && modelsLoadError && { error: modelsLoadError.message, hint: "Run 'npm install' in the project root if you see 'Cannot find module'. Otherwise check MySQL and .env." }),
    });
  });
}

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Keep process alive; avoid exit code 1 from unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message || err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message || err);
});

module.exports = app;
