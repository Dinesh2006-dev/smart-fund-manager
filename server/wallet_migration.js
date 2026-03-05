const { db } = require('./src/config/db');

const migrate = async () => {
    try {
        console.log('Starting Wallet Migration...');

        // Add wallet_balance to users if not exists
        const hasWalletBalance = await db.schema.hasColumn('users', 'wallet_balance');
        if (!hasWalletBalance) {
            await db.schema.table('users', (table) => {
                table.decimal('wallet_balance').defaultTo(0);
            });
            console.log('Added wallet_balance column to users table');
        } else {
            console.log('wallet_balance column already exists in users table');
        }

        // Create wallet_transactions if not exists
        const hasWalletTransactions = await db.schema.hasTable('wallet_transactions');
        if (!hasWalletTransactions) {
            await db.schema.createTable('wallet_transactions', (table) => {
                table.increments('id').primary();
                table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
                table.decimal('amount').notNullable();
                table.string('type').notNullable(); // deposit, withdrawal, payment
                table.string('description');
                table.timestamp('transaction_date').defaultTo(db.fn.now());
                table.timestamps(true, true);
            });
            console.log('Created wallet_transactions table');
        } else {
            console.log('wallet_transactions table already exists');
        }

        console.log('Wallet Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Wallet Migration failed:', error);
        process.exit(1);
    }
};

migrate();
