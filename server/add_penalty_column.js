const { db } = require('./src/config/db');

async function addPenaltyColumn() {
    try {
        const hasColumn = await db.schema.hasColumn('payments', 'penalty');
        if (!hasColumn) {
            await db.schema.table('payments', table => {
                table.decimal('penalty', 10, 2).defaultTo(0);
            });
            console.log('✅ Added "penalty" column to "payments" table.');
        } else {
            console.log('ℹ️ "penalty" column already exists.');
        }
    } catch (error) {
        console.error('❌ Error adding column:', error);
    } finally {
        process.exit();
    }
}

addPenaltyColumn();
