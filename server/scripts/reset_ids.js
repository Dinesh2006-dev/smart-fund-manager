const knex = require('knex');
const path = require('path');

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: path.join(__dirname, '../database.sqlite'),
    },
    useNullAsDefault: true,
});

const resetCounters = async () => {
    try {
        console.log('--- Resetting Database ID Counters ---');

        // SQLite stores auto-increment info in a special table called sqlite_sequence
        // We delete entries for our main tables to reset them to 1
        const tables = ['funds', 'users', 'payments', 'user_funds', 'wallet_transactions'];

        for (const table of tables) {
            console.log(`Resetting counter for: ${table}`);
            await db('sqlite_sequence').where('name', table).del();
        }

        console.log('--- Counters Reset Successfully! ---');
        console.log('The next item you create will now have ID #1.');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting counters:', error);
        process.exit(1);
    }
};

resetCounters();
