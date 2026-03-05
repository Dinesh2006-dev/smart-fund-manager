const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { auth, admin } = require('../middleware/auth');
const balanceService = require('../services/balanceService');

// Create a Fund (Admin Only)
router.post('/', auth, admin, async (req, res) => {
    try {
        const { name, total_amount, contribution_amount, duration, type, start_date, end_date, terms } = req.body;

        if (!duration) {
            return res.status(400).json({ message: 'Duration (Terms) is required for tenure-based tracking' });
        }

        await db('funds').insert({
            name,
            total_amount,
            contribution_amount: contribution_amount || null,
            duration,
            type, // daily, weekly, monthly
            start_date,
            end_date,
            terms // New field
        });

        res.status(201).json({ message: 'Fund created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating fund' });
    }
});

// Get all Funds (Logged in users) with member counts
router.get('/', auth, async (req, res) => {
    try {
        const funds = await db('funds')
            .leftJoin('user_funds', 'funds.id', 'user_funds.fund_id')
            .select('funds.*')
            .count('user_funds.id as member_count')
            .groupBy('funds.id');
        res.json(funds);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching funds' });
    }
});

// Edit a Fund (Admin Only)
router.put('/:id', auth, admin, async (req, res) => {
    try {
        const { name, total_amount, contribution_amount, duration, type, start_date, end_date, terms } = req.body;

        await db('funds').where({ id: req.params.id }).update({
            name,
            total_amount,
            contribution_amount: contribution_amount || null,
            duration,
            type,
            start_date,
            end_date,
            terms // Update Logic
        });
        res.json({ message: 'Fund updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating fund' });
    }
});

// Get members of a specific fund
router.get('/:id/members', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const members = await db('user_funds as uf')
            .join('users as u', 'uf.user_id', 'u.id')
            .where('uf.fund_id', id)
            .select('u.id', 'u.name', 'u.email', 'uf.joined_at', 'uf.total_paid', 'uf.pending_balance', 'uf.status');
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fund members' });
    }
});

// Admin ONLY: Get Month-wise Tracking Grid Data
router.get('/:id/tracking', auth, admin, async (req, res) => {
    try {
        const { id } = req.params;
        const fund = await db('funds').where({ id }).first();
        if (!fund) return res.status(404).json({ message: 'Fund not found' });

        const members = await db('user_funds as uf')
            .join('users as u', 'uf.user_id', 'u.id')
            .where('uf.fund_id', id)
            .select('u.id', 'u.name');

        const monthlyTarget = Number(fund.total_amount) / Number(fund.duration);
        const startDate = new Date(fund.start_date);

        const trackingData = [];

        for (const member of members) {
            const payments = await db('payments')
                .where({ fund_id: id, user_id: member.id })
                .orderBy('payment_month', 'asc');

            const { months } = balanceService._calculateTracking(fund, payments);

            trackingData.push({
                userId: member.id,
                userName: member.name,
                months
            });
        }

        res.json({
            fundName: fund.name,
            monthlyTarget,
            duration: fund.duration,
            tracking: trackingData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching tracking data' });
    }
});

// Get all enrollments for a specific user
router.get('/memberships/:userId', auth, async (req, res) => {
    try {
        const enrollments = await db('user_funds')
            .join('funds', 'user_funds.fund_id', 'funds.id')
            .where('user_funds.user_id', req.params.userId)
            .select('funds.name', 'user_funds.total_paid', 'user_funds.pending_balance', 'user_funds.status');
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user memberships' });
    }
});

// Join a fund (User self-enrollment)
router.post('/join', auth, async (req, res) => {
    try {
        const { fund_id, payment_schedule } = req.body;
        const user_id = req.user.id;

        // Check if fund exists
        const fund = await db('funds').where({ id: fund_id, status: 'active' }).first();
        if (!fund) {
            return res.status(404).json({ message: 'Fund not found or closed' });
        }

        // Check if already joined (Block re-join if record exists, even if withdrawn)
        const existing = await db('user_funds').where({ user_id, fund_id }).first();
        if (existing) {
            if (existing.status === 'withdrawn') {
                return res.status(400).json({ message: 'You have previously withdrawn from this fund and cannot re-join.' });
            }
            return res.status(400).json({ message: 'You have already joined this fund.' });
        }

        // Calculate catch-up installments
        const startDate = new Date(fund.start_date);
        const today = new Date();
        let monthsPassed = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
        monthsPassed = Math.max(0, Math.min(monthsPassed, fund.duration));

        const monthlyInstallment = Number(fund.total_amount) / Number(fund.duration);
        const catchupAmount = monthsPassed * monthlyInstallment;

        console.log(`[Join] User ${user_id}, Fund ${fund_id}, Catch-up: ${monthsPassed} months, Amount: ₹${catchupAmount}`);

        // 1. Insert Enrollment
        const [enrollmentId] = await db('user_funds').insert({
            user_id,
            fund_id,
            total_paid: 0,
            pending_balance: fund.total_amount,
            payment_schedule: payment_schedule || 'monthly',
            status: 'active'
        });

        // 2. If catch-up needed, record payment
        if (catchupAmount > 0) {
            const currentMonth = today.toISOString().slice(0, 7);
            await db('payments').insert({
                user_id,
                fund_id,
                amount: catchupAmount,
                payment_date: db.fn.now(),
                payment_month: currentMonth,
                notes: `Opening catch-up payment for ${monthsPassed} months missed.`
            });

            // Sync immediately
            await balanceService.syncEnrollment(user_id, fund_id);
        }

        res.status(201).json({
            message: 'Successfully joined the fund',
            catchupMonths: monthsPassed,
            catchupAmount
        });
    } catch (error) {
        console.error('[Join] Error:', error);
        res.status(500).json({ message: 'Error joining fund' });
    }
});

// Delete a Fund (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const fundId = req.params.id;

        // Manually delete dependencies for robustness
        await db('payments').where({ fund_id: fundId }).del();
        await db('user_funds').where({ fund_id: fundId }).del();

        await db('funds').where({ id: fundId }).del();
        res.json({ message: 'Fund deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting fund', error: error.message });
    }
});

// Emergency Withdrawal (Apply 2% fee)
router.post('/withdraw', auth, async (req, res) => {
    try {
        const { fund_id, amount } = req.body;
        const user_id = req.user.id;
        const withdrawalAmount = Number(amount);

        if (!withdrawalAmount || withdrawalAmount <= 0) {
            return res.status(400).json({ message: 'Invalid withdrawal amount' });
        }

        // 1. Get Enrollment & Total Paid
        const enrollment = await db('user_funds').where({ user_id, fund_id }).first();
        if (!enrollment) {
            return res.status(404).json({ message: 'You are not enrolled in this fund' });
        }

        if (withdrawalAmount > Number(enrollment.total_paid)) {
            return res.status(400).json({ message: 'Insufficient balance in fund' });
        }

        // 2. Calculate 10% Fee
        const fee = withdrawalAmount * 0.10;
        const payout = withdrawalAmount - fee;

        // 3. Record "Negative Payment" (Debit) to reduce balance
        // We use current month for tracking
        const currentMonth = new Date().toISOString().slice(0, 7);

        await db('payments').insert({
            user_id,
            fund_id,
            amount: -withdrawalAmount, // Negative amount to deduct from ledger
            payment_date: db.fn.now(),
            payment_month: currentMonth,
            notes: `Emergency Withdrawal: Payout ₹${payout.toFixed(2)} (Fee ₹${fee.toFixed(2)})`
        });

        // 4. Update status to 'withdrawn' and sync balance
        await db('user_funds')
            .where({ user_id, fund_id })
            .update({ status: 'withdrawn' });

        await balanceService.syncEnrollment(user_id, fund_id);

        res.status(200).json({
            message: 'Withdrawal successful',
            payout: Number(payout.toFixed(2)),
            fee: Number(fee.toFixed(2))
        });
    } catch (error) {
        console.error('[Withdraw] Error:', error);
        res.status(500).json({ message: 'Error processing withdrawal' });
    }
});

module.exports = router;
