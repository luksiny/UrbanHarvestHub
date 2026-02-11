const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Override with production database credentials for remote seeding
process.env.NODE_ENV = 'production';

// Import and run the seed script
require('./seed.js');
