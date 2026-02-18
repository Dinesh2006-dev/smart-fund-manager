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

        // Auto-detect month if not detecting
        const finalMonth = payment_month || new Date(payment_date).toISOString().slice(0, 7);

        // --- Validation: Enforce Consistent Payment Mode per Month ---
        console.log(`[Validation] Checking for existing payments: User ${finalUserId}, Fund ${fund_id}, Month ${finalMonth}`);

        const existingPayments = await db('payments')
            .where({ user_id: finalUserId, fund_id, payment_month: finalMonth })
            .select('payment_schedule');

        if (existingPayments.length > 0) {
            const existingMode = existingPayments[0].payment_schedule.toLowerCase();
            const newMode = (payment_schedule || 'monthly').toLowerCase();

            console.log(`[Validation] Found ${existingPayments.length} records. Mode: ${existingMode}. New Mode: ${newMode}`);

            if (existingMode !== newMode) {
                console.warn(`[Validation] Blocked! Mismatch: ${existingMode} vs ${newMode}`);
                return res.status(400).json({
                    message: `Payment Mode Mismatch! You have already started paying for ${finalMonth} using '${existingMode.toUpperCase()}' mode. You cannot switch to '${newMode.toUpperCase()}' for this month.`
                });
            }

            // --- Validation: Limit Payments per Schedule ---
            let limit = 0;
            const [y, m] = finalMonth.split('-').map(Number);
            const daysInMonth = new Date(y, m, 0).getDate();

            if (existingMode === 'monthly') {
                limit = 1;
            } else if (existingMode === 'weekly') {
                limit = Math.ceil(daysInMonth / 7);
            } else if (existingMode === 'daily') {
                limit = daysInMonth;
            }

            if (existingPayments.length >= limit) {
                return res.status(400).json({
                    message: `Payment Limit Reached! You have already made ${existingPayments.length} payments this month. The limit for '${existingMode}' mode is ${limit}.`
                });
            }
            // -----------------------------------------------
        }
        // -------------------------------------------------------------

        // 1. Record the payment
        const [paymentId] = await db('payments').insert({
            user_id: finalUserId,
            fund_id,
            amount,
            penalty: req.body.penalty || 0, // Store penalty
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

// Check if a payment mode is already set for a specific month
router.get('/check-mode', auth, async (req, res) => {
    try {
        const { fund_id, payment_month } = req.query;
        const user_id = req.user.id;

        if (!fund_id || !payment_month) {
            return res.status(400).json({ message: 'Missing fund_id or payment_month' });
        }

        const existingPayment = await db('payments')
            .where({ user_id, fund_id, payment_month })
            .first();

        if (existingPayment) {
            return res.json({ mode: existingPayment.payment_schedule });
        }

        res.json({ mode: null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error checking payment mode' });
    }
});

module.exports = router;
