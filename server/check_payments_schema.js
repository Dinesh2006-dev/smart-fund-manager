const { db } = require('./src/config/db');

async function checkPaymentsSchema() {
    try {
        const columns = await db('payments').columnInfo();
        console.log('--- Payments Table Columns ---');
        console.log(JSON.stringify(columns, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkPaymentsSchema();
