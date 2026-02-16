const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
// process.env.NODE_ENV = 'production';
const { User, sequelize } = require('../models');

async function createUsers() {
    const users = [
        { email: 'user1@urbanharvesthub.com', password: 'pass123', name: 'user1' },
        { email: 'user2@urbanharvesthub.com', password: 'pass123', name: 'user2' },
        { email: 'user3@urbanharvesthub.com', password: 'pass123', name: 'user3' },
    ];

    try {
        console.log('🔄 Syncing User table...');
        await User.sync({ alter: true });
        console.log('✅ User table synced.');
        for (const userData of users) {
            const [user, created] = await User.findOrCreate({
                where: { email: userData.email },
                defaults: userData,
            });

            if (created) {
                console.log(`✅ Created user: ${userData.email}`);
            } else {
                console.log(`ℹ️ User already exists: ${userData.email}. Updating password...`);
                user.password = userData.password;
                await user.save();
                console.log(`✅ Updated password for: ${userData.email}`);
            }
        }
        console.log('✨ All users have been processed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating users:', err);
        process.exit(1);
    }
}

createUsers();
