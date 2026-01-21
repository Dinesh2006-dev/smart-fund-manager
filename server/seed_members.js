const bcrypt = require('bcryptjs');
const { db, initDb } = require('./src/config/db');

const seedMembers = async () => {
    await initDb();

    // 1. Create Funds
    const fundsList = [
        {
            name: 'Diwali Chit 2026',
            total_amount: 15000,
            contribution_amount: 300,
            duration: 50,
            type: 'weekly',
            start_date: '2026-01-01',
            status: 'active'
        },
        {
            name: 'Normal Savings Chit',
            total_amount: 25000,
            contribution_amount: 2500,
            duration: 10,
            type: 'monthly',
            start_date: '2026-01-01',
            status: 'active'
        }
    ];

    for (const fund of fundsList) {
        const existing = await db('funds').where({ name: fund.name }).first();
        if (!existing) {
            await db('funds').insert(fund);
            console.log(`Fund created: ${fund.name}`);
        }
    }

    // 2. Create Members (Users with role 'user')
    const membersList = [
        { name: 'John Doe', email: 'john@example.com', phone: '9876543210' },
        { name: 'Jane Smith', email: 'jane@example.com', phone: '8765432109' },
        { name: 'Robert Brown', email: 'robert@example.com', phone: '7654321098' }
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

    // 3. Enroll Members in Funds
    const dbFunds = await db('funds').select('id', 'name', 'total_amount');
    const dbUsers = await db('users').where({ role: 'user' }).select('id', 'name');

    for (const user of dbUsers) {
        for (const fund of dbFunds) {
            const existingEnrollment = await db('user_funds').where({ user_id: user.id, fund_id: fund.id }).first();
            if (!existingEnrollment) {
                await db('user_funds').insert({
                    user_id: user.id,
                    fund_id: fund.id,
                    total_paid: 0,
                    pending_balance: fund.total_amount,
                    status: 'active'
                });
                console.log(`Enrolled ${user.name} in ${fund.name}`);
            }
        }
    }

    console.log('Database seeding complete!');
    process.exit();
};

seedMembers();
