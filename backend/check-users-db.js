const { User } = require('./models');

async function checkUsers() {
    try {
        const count = await User.count();
        console.log('User count:', count);
        const users = await User.findAll({ attributes: ['id', 'email', 'name'] });
        console.log('Users:', JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUsers();
