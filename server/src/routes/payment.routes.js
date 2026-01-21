const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { auth, admin } = require('../middleware/auth');
const balanceService = require('../services/balanceService');

// Add a Payment (Both Admin and User can add, but Admin has full control)
router.post('/', auth, async (req, res) => {
    try {
        const { user_id, fund_id, amount, payment_date, payment_month, payment_schedule, mode, notes } = req.body;

        // Security check: Users can only add payments for themselves, Admins can add for anyone
        const finalUserId = req.user.role === 'admin' ? user_id : req.user.id;

        // Auto-detect month if not provided
        const finalMonth = payment_month || new Date(payment_date).toISOString().slice(0, 7);

        // 1. Record the payment
        const [paymentId] = await db('payments').insert({
            user_id: finalUserId,
            fund_id,
            amount,
            payment_date,
            payment_month: finalMonth,
            payment_schedule: payment_schedule || 'monthly',
            mode,
            notes
        });

        // 2. Sync balances using the Source of Truth engine
        await balanceService.syncEnrollment(finalUserId, fund_id);

        res.status(201).json({ message: 'Payment recorded and balance updated', paymentId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing payment' });
    }
});

// Get payment history (For User or Admin)
router.get('/', auth, async (req, res) => {
    try {
        let query = db('payments as p')
            .join('users as u', 'p.user_id', 'u.id')
            .join('funds as f', 'p.fund_id', 'f.id')
            .select(
                'p.*',
                'u.name as user_name',
                'f.name as fund_name'
            );

        // If not admin, only show their own payments
        if (req.user.role !== 'admin') {
            query = query.where('p.user_id', req.user.id);
        }

        const history = await query.orderBy('p.payment_date', 'desc');
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment history' });
    }
});

// Export Payments as CSV
router.get('/export/csv', auth, async (req, res) => {
    try {
        let query = db('payments as p')
            .join('users as u', 'p.user_id', 'u.id')
            .join('funds as f', 'p.fund_id', 'f.id')
            .select(
                'p.payment_date',
                'p.payment_month',
                'p.payment_schedule',
                'u.name as user_name',
                'f.name as fund_name',
                'p.amount',
                'p.mode',
                'p.notes'
            );

        if (req.user.role !== 'admin') {
            query = query.where('p.user_id', req.user.id);
        }

        const payments = await query.orderBy('p.payment_date', 'desc');

        // Generate CSV string
        const header = 'Date,Month,Frequency,User,Fund,Amount,Mode,Notes\n';
        const rows = payments.map(p =>
            `${p.payment_date},${p.payment_month},${p.payment_schedule},${p.user_name},${p.fund_name},${p.amount},${p.mode},"${p.notes || ''}"`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
        res.send(header + rows);
    } catch (error) {
        res.status(500).json({ message: 'Error exporting CSV' });
    }
});

// Admin ONLY: Delete a Payment and Sync Balance
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await db('payments').where({ id }).first();

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Delete the payment
        await db('payments').where({ id }).del();

        // Recalculate balance for this user and fund
        await balanceService.syncEnrollment(payment.user_id, payment.fund_id);

        res.json({ message: 'Payment deleted and balance recalculated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting payment' });
    }
});

module.exports = router;
