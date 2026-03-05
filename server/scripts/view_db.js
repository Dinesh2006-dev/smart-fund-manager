const knex = require('knex');
const path = require('path');

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: path.join(__dirname, '../database.sqlite'),
    },
    useNullAsDefault: true,
});

const dumpDb = async () => {
    try {
        const tables = ['users', 'funds', 'user_funds', 'payments', 'wallet_transactions'];

        for (const table of tables) {
            console.log(`\n=== TABLE: ${table} ===`);
            const rows = await db(table).select('*');
            if (rows.length === 0) {
                console.log('(Empty)');
            } else {
                console.table(rows);
            }
        }
        process.exit(0);
    } catch (error) {
        console.error('Error dumping database:', error);
        process.exit(1);
    }
};

dumpDb();
