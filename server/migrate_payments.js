const { db } = require('./src/config/db');

async function migratePayments() {
    try {
        console.log('Starting payments migration...');

        // 1. Rename existing payments table
        const hasTable = await db.schema.hasTable('payments');
        if (hasTable) {
            const hasMonth = await db.schema.hasColumn('payments', 'payment_month');
            if (hasMonth) {
                console.log('Payments table already has payment_month column. Skipping migration.');
                process.exit(0);
            }

            await db.schema.renameTable('payments', 'payments_old');
            console.log('Renamed payments to payments_old');
        }

        // 2. Create new payments table with correct columns
        await db.schema.createTable('payments', (table) => {
            table.increments('id').primary();
            table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
            table.integer('fund_id').references('id').inTable('funds').onDelete('CASCADE');
            table.decimal('amount').notNullable();
            table.date('payment_date').notNullable();
            table.string('payment_month').notNullable(); // YYYY-MM
            table.string('payment_schedule').notNullable().defaultTo('monthly'); // daily, weekly, monthly
            table.string('mode'); // Cash, UPI, Bank Transfer
            table.string('notes');
            table.timestamps(true, true);
        });
        console.log('Created new payments table');

        // 3. Copy data from old to new (defaulting month to the month of payment_date)
        if (hasTable) {
            await db.raw(`
                INSERT INTO payments (id, user_id, fund_id, amount, payment_date, payment_month, payment_schedule, mode, notes, created_at, updated_at)
                SELECT id, user_id, fund_id, amount, payment_date, strftime('%Y-%m', payment_date), 'monthly', mode, notes, created_at, updated_at
                FROM payments_old
            `);
            console.log('Data migrated to new payments table');

            // 4. Drop old table
            await db.schema.dropTable('payments_old');
            console.log('Dropped payments_old');
        }

        console.log('Payments migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Payments migration failed:', error);
        process.exit(1);
    }
}

migratePayments();
