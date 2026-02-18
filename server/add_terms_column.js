const { db } = require('./src/config/db');

async function addTermsColumn() {
    try {
        const hasColumn = await db.schema.hasColumn('funds', 'terms');
        if (!hasColumn) {
            await db.schema.table('funds', table => {
                table.text('terms'); // Text column for longer descriptions
            });
            console.log('✅ Added "terms" column to "funds" table.');
        } else {
            console.log('ℹ️ "terms" column already exists.');
        }
    } catch (error) {
        console.error('❌ Error adding column:', error);
    } finally {
        process.exit();
    }
}

addTermsColumn();
