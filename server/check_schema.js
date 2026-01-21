const { db } = require('./src/config/db');

async function checkSchema() {
    try {
        const columns = await db('funds').columnInfo();
        console.log('--- Funds Table Columns ---');
        console.log(JSON.stringify(columns, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
