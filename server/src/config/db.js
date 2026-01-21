const knex = require('knex');
const path = require('path');

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: path.join(__dirname, '../../database.sqlite'),
    },
    useNullAsDefault: true, // Required for SQLite
});

// This function will create our tables if they don't exist
const initDb = async () => {
    try {
        // Users Table
        const hasUsers = await db.schema.hasTable('users');
        if (!hasUsers) {
            await db.schema.createTable('users', (table) => {
                table.increments('id').primary();
                table.string('name').notNullable();
                table.string('email').unique().notNullable();
                table.string('password').notNullable();
                table.string('role').defaultTo('user'); // admin or user
                table.string('phone');
                table.string('reset_otp').nullable();
                table.timestamp('reset_otp_expiry').nullable();
                table.timestamps(true, true);
            });
            console.log('Users table created');
        }

        // Funds Table
        const hasFunds = await db.schema.hasTable('funds');
        if (!hasFunds) {
            await db.schema.createTable('funds', (table) => {
                table.increments('id').primary();
                table.string('name').notNullable();
                table.decimal('total_amount').notNullable();
                table.decimal('contribution_amount').nullable(); // Made optional
                table.integer('duration').notNullable(); // Made required for tenure
                table.string('type').defaultTo('monthly'); // daily, weekly, monthly
                table.date('start_date');
                table.date('end_date');
                table.string('status').defaultTo('active');
                table.timestamps(true, true);
            });
            console.log('Funds table created');
        }

        // User_Funds (Enrollments)
        const hasUserFunds = await db.schema.hasTable('user_funds');
        if (!hasUserFunds) {
            await db.schema.createTable('user_funds', (table) => {
                table.increments('id').primary();
                table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
                table.integer('fund_id').references('id').inTable('funds').onDelete('CASCADE');
                table.decimal('total_paid').defaultTo(0);
                table.decimal('pending_balance').defaultTo(0);
                table.string('payment_schedule'); // Will inherit from fund
                table.string('status').defaultTo('active');
                table.timestamp('joined_at').defaultTo(db.fn.now());
                table.timestamps(true, true);
            });
            console.log('User_Funds table created');
        }

        // Payments Table
        const hasPayments = await db.schema.hasTable('payments');
        if (!hasPayments) {
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
            console.log('Payments table created');
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

module.exports = { db, initDb };
