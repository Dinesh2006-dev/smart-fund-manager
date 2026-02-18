const { db } = require('./src/config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        // 1. Check if funds_old already exists (cleanup from failed run)
        const hasOld = await db.schema.hasTable('funds_old');
        if (hasOld) {
            await db.schema.dropTable('funds_old');
        }

        // 2. Rename existing funds table
        await db.schema.renameTable('funds', 'funds_old');
        console.log('Renamed funds to funds_old');

        // 3. Create new funds table with correct constraints
        await db.schema.createTable('funds', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.decimal('total_amount').notNullable();
            table.decimal('contribution_amount').nullable(); // Correctly nullable
            table.integer('duration').notNullable(); // Correctly required
            table.string('type').defaultTo('monthly');
            table.date('start_date');
            table.date('end_date');
            table.string('status').defaultTo('active');
            table.timestamps(true, true);
        });
        console.log('Created new funds table');

        // 4. Copy data from old to new
        // We'll select columns that exist in both. Note: duration might be NULL in old data, 
        // so we provide a default during copy if necessary.
        await db.raw(`
            INSERT INTO funds (id, name, total_amount, contribution_amount, duration, type, start_date, end_date, status, created_at, updated_at)
            SELECT id, name, total_amount, contribution_amount, COALESCE(duration, 0), type, start_date, end_date, status, created_at, updated_at
            FROM funds_old
        `);
        console.log('Data migrated to new funds table');

        // 5. Drop old table
        await db.schema.dropTable('funds_old');
        console.log('Dropped funds_old');

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
