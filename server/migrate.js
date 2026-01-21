const { db } = require('./src/config/db');

const migrate = async () => {
    try {
        const hasFrequency = await db.schema.hasColumn('user_funds', 'payment_schedule');
        if (!hasFrequency) {
            await db.schema.table('user_funds', (table) => {
                table.string('payment_schedule').defaultTo('monthly');
                console.log('Added payment_schedule column to user_funds');
            });
        }

        const hasJoinedAt = await db.schema.hasColumn('user_funds', 'joined_at');
        if (!hasJoinedAt) {
            await db.schema.table('user_funds', (table) => {
                table.timestamp('joined_at').defaultTo('2026-01-01 00:00:00');
                console.log('Added joined_at column to user_funds');
            });
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
