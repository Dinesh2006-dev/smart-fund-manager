const bcrypt = require('bcryptjs');
const { db, initDb } = require('./src/config/db');

const seed = async () => {
    await initDb();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '123456';
    const existing = await db('users').where({ email: adminEmail }).first();

    if (!existing) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        await db('users').insert({
            name: 'System Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin'
        });
        console.log(`Seed: Admin user created (${adminEmail} / ${adminPassword})`);
    } else {
        console.log('Seed: Admin user already exists');
    }
    process.exit();
};

seed();
