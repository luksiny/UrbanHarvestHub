const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { Admin } = require('../models');

async function updatePassword(email, newPassword) {
    try {
        const admin = await Admin.findOne({ where: { email } });
        if (!admin) {
            console.log(`Admin with email ${email} not found.`);
            return;
        }

        admin.password = newPassword;
        await admin.save();
        console.log(`✅ Password updated successfully for ${email}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating password:', err);
        process.exit(1);
    }
}

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node update-admin.js <email> <newPassword>');
    process.exit(1);
}

updatePassword(args[0], args[1]);
