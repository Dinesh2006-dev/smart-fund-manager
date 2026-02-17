const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { auth, admin } = require('../middleware/auth');
const balanceService = require('../services/balanceService');

// Admin Dashboard Stats
router.get('/admin/stats', auth, admin, async (req, res) => {
    try {
        const totalMembers = await db('users').where('role', 'user').count('id as count').first();
        const totalFunds = await db('funds').count('id as count').first();
        const collection = await db('payments').sum('amount as total').first();
        const pending = await db('user_funds').sum('pending_balance as total').first();

        // Daily collections for chart (last 7 days)
        const daily = await db('payments')
            .select('payment_date')
            .sum('amount as total')
            .groupBy('payment_date')
            .orderBy('payment_date', 'desc')
            .limit(7);

        // Fund-wise summaries for easy visibility
        const fundSummaries = await db('funds')
            .leftJoin('user_funds', 'funds.id', 'user_funds.fund_id')
            .select('funds.name', 'funds.id')
            .count('user_funds.id as count')
            .groupBy('funds.id', 'funds.name');

        res.json({
            totalUsers: totalMembers.count,
            totalFunds: totalFunds.count,
            totalCollected: collection.total || 0,
            totalPending: pending.total || 0,
            dailyCollections: daily,
            fundSummaries: fundSummaries
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching admin stats' });
    }
});

// User Dashboard Stats
router.get('/user/summary', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const fundsJoined = await db('user_funds').where({ user_id: userId }).count('id as count').first();

        // Derive Total Paid and Pending directly from payments records
        const payments = await db('payments').where({ user_id: userId });
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        const enrollments = await db('user_funds as uf')
            .join('funds as f', 'uf.fund_id', 'f.id')
            .where('uf.user_id', userId)
            .select('f.total_amount');
        const totalFundValue = enrollments.reduce((sum, e) => sum + Number(e.total_amount), 0);
        const pendingBalance = Math.max(0, totalFundValue - totalPaid);

        // Detailed list of funds for the user
        const funds = await db('user_funds as uf')
            .join('funds as f', 'uf.fund_id', 'f.id')
            .where('uf.user_id', userId)
            .select(
                'f.id as fund_id',
                'f.name',
                'uf.total_paid',
                'uf.pending_balance',
                'f.status',
                'f.total_amount',
                'f.duration',
                'f.start_date',
                'uf.payment_schedule',
                'uf.joined_at'
            );

        // Add progress and overdue logic
        const enrichedFunds = await Promise.all(funds.map(async f => {
            const payments = await db('payments').where({ user_id: userId, fund_id: f.fund_id });
            const { months, monthlyTarget } = balanceService._calculateTracking(f, payments);

            const progress = (Number(f.total_paid) / Number(f.total_amount)) * 100;
            const overdue = balanceService._calculateOverdue(f, payments, monthlyTarget);

            const currentMonthData = await balanceService.getCurrentMonthBalance(userId, f.fund_id);

            // Calculate next due date based on schedule
            const intervalsPaid = Math.floor(Number(f.total_paid) / monthlyTarget);

            let nextDue = new Date(f.start_date);
            // Safety check for invalid start_date
            if (isNaN(nextDue.getTime())) {
                nextDue = new Date(); // Fallback to now if invalid
            }

            nextDue.setMonth(nextDue.getMonth() + intervalsPaid);

            let displayDueDate = '';
            const schedule = f.payment_schedule || 'monthly';

            if (schedule === 'monthly') {
                // Monthly: Due date is the 5th of the month
                nextDue.setDate(5);
                displayDueDate = nextDue.toISOString().split('T')[0];
            } else if (schedule === 'weekly') {
                // Weekly: Due every Sunday
                const today = new Date();
                const dayOfWeek = today.getDay(); // 0 = Sunday
                const daysUntilSunday = (7 - dayOfWeek) % 7;
                const nextSunday = new Date(today);
                nextSunday.setDate(today.getDate() + daysUntilSunday);
                displayDueDate = nextSunday.toISOString().split('T')[0];
            } else {
                // Daily or others
                displayDueDate = 'Daily';
            }

            return {
                ...f,
                progress: Math.min(progress, 100).toFixed(2),
                next_due_date: displayDueDate,
                next_due_month: nextDue.toISOString().slice(0, 7),
                overdueMonths: overdue,
                currentMonthBalance: currentMonthData.balance,
                currentMonth: currentMonthData.month,
                weeksInMonth: currentMonthData.weeksInMonth,
                daysInMonth: currentMonthData.daysInMonth,
                recommendedWeekly: currentMonthData.recommendedWeekly,
                recommendedDaily: currentMonthData.recommendedDaily
            };
        }));

        res.json({
            fundsJoined: fundsJoined.count,
            totalPaid,
            pendingBalance,
            funds: enrichedFunds
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user summary' });
    }
});

module.exports = router;
