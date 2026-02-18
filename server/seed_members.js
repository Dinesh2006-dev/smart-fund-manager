const bcrypt = require('bcryptjs');
const { db, initDb } = require('./src/config/db');

const seedMembers = async () => {
    await initDb();

    // 2. Create Members (Users with role 'user')
    const membersList = [
    ];

    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    for (const member of membersList) {
        const existing = await db('users').where({ email: member.email }).first();
        if (!existing) {
            await db('users').insert({
                ...member,
                password: hashedPassword,
                role: 'user'
            });
            console.log(`Member created: ${member.name} (${member.email})`);
        }
    }

    console.log('Database seeding complete! (Users only)');
    process.exit();
};

seedMembers();
