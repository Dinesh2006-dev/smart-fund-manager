const knex = require('knex');
const path = require('path');

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: path.join(__dirname, '../database.sqlite'),
    },
    useNullAsDefault: true,
});

const cleanup = async () => {
    try {
        console.log('--- Starting Database Cleanup ---');

        // 1. Clear Transactional Tables
        console.log('Cleaning Payments...');
        await db('payments').del();

        console.log('Cleaning User Enrollments (user_funds)...');
        await db('user_funds').del();

        console.log('Cleaning Wallet Transactions...');
        await db('wallet_transactions').del();

        console.log('Cleaning Funds...');
        await db('funds').del();

        // 2. Clear Users except Admin
        console.log('Cleaning non-admin users...');
        await db('users').whereNot('role', 'admin').del();

        // 3. Reset admin wallet balance if needed
        console.log('Resetting admin wallet balances...');
        await db('users').where('role', 'admin').update({ wallet_balance: 0 });

        console.log('--- Cleanup Complete! ---');
        console.log('Your database is now fresh. Only Admin accounts remain.');
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
};

cleanup();
