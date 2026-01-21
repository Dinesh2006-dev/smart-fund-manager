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
