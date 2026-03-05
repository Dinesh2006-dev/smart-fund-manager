const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { auth } = require('../middleware/auth');

// @route   GET /api/wallet/balance
// @desc    Get user wallet balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
    try {
        const user = await db('users').where({ id: req.user.id }).first();
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ balance: user.wallet_balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/wallet/deposit
// @desc    Deposit money into wallet
// @access  Private
router.post('/deposit', auth, async (req, res) => {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }

    const trx = await db.transaction();
    try {
        const user = await trx('users').where({ id: req.user.id }).first();
        if (!user) {
            await trx.rollback();
            return res.status(404).json({ message: 'User not found' });
        }

        const newBalance = Number(user.wallet_balance || 0) + Number(amount);
        await trx('users').where({ id: req.user.id }).update({ wallet_balance: newBalance });

        await trx('wallet_transactions').insert({
            user_id: req.user.id,
            amount: amount,
            type: 'deposit',
            description: description || 'Wallet Deposit',
            transaction_date: db.fn.now()
        });

        await trx.commit();
        res.json({ message: 'Deposit successful', newBalance });
    } catch (error) {
        await trx.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/wallet/history
// @desc    Get wallet transaction history
// @access  Private
router.get('/history', auth, async (req, res) => {
    try {
        const history = await db('wallet_transactions')
            .where({ user_id: req.user.id })
            .orderBy('transaction_date', 'desc');
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
