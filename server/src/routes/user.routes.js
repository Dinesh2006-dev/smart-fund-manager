const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { auth, admin } = require('../middleware/auth');

// Get all users (Admin Only)
router.get('/', auth, admin, async (req, res) => {
    try {
        const users = await db('users').select('id', 'name', 'email', 'role', 'phone', 'created_at');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Assign user to a fund (Admin Only)
router.post('/assign-fund', auth, admin, async (req, res) => {
    try {
        const { user_id, fund_id } = req.body;

        // Check if already assigned
        const existing = await db('user_funds').where({ user_id, fund_id }).first();
        if (existing) {
            return res.status(400).json({ message: 'User already assigned to this fund' });
        }

        // Get fund details to set initial balance
        const fund = await db('funds').where({ id: fund_id }).first();
        if (!fund) return res.status(404).json({ message: 'Fund not found' });

        await db('user_funds').insert({
            user_id,
            fund_id,
            total_paid: 0,
            pending_balance: fund.total_amount, // Initially, they owe the full amount
            payment_schedule: fund.type, // Inherit frequency (Daily/Weekly/Monthly)
            status: 'active'
        });

        res.status(201).json({ message: 'User assigned to fund successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error assigning fund' });
    }
});

// Get User Financial Report (Admin Only)
router.get('/:id/report', auth, admin, async (req, res) => {
    try {
        const userId = req.params.id;
        const { fund_id } = req.query;

        const user = await db('users').where({ id: userId }).first();
        if (!user) return res.status(404).json({ message: 'User not found' });

        let fundsQuery = db('user_funds as uf')
            .join('funds as f', 'uf.fund_id', 'f.id')
            .where('uf.user_id', userId)
            .select(
                'f.id as fund_id', 'f.name as fund_name', 'f.total_amount', 'f.start_date', 'f.duration',
                'uf.total_paid', 'uf.pending_balance', 'uf.status', 'uf.joined_at'
            );

        if (fund_id) {
            fundsQuery = fundsQuery.where('f.id', fund_id);
        }

        const funds = await fundsQuery;

        // Fetch payments
        let paymentsQuery = db('payments')
            .where('user_id', userId)
            .orderBy('payment_date', 'desc');

        if (fund_id) {
            paymentsQuery = paymentsQuery.where('fund_id', fund_id);
        }

        const payments = await paymentsQuery;

        res.json({
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
            funds,
            payments
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating report' });
    }
});

// Delete a User (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent admin from deleting themselves
        if (userId == req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own admin account.' });
        }

        // Manually delete dependencies for robustness
        await db('payments').where({ user_id: userId }).del();
        await db('user_funds').where({ user_id: userId }).del();

        await db('users').where({ id: userId }).del();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

module.exports = router;
