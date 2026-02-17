const { db } = require('../config/db');

/**
 * BalanceService: The Source of Truth for Fund Calculations
 * This service derives all balances and statuses directly from the 'payments' table.
 */
class BalanceService {
    /**
     * Recalculates and syncs the balance for a specific user enrollment.
     * @param {number} userId 
     * @param {number} fundId 
     */
    async syncEnrollment(userId, fundId) {
        const fund = await db('funds').where({ id: fundId }).first();
        const enrollment = await db('user_funds').where({ user_id: userId, fund_id: fundId }).first();

        if (!fund || !enrollment) return;

        // 1. Get all payments for this enrollment
        const payments = await db('payments')
            .where({ user_id: userId, fund_id: fundId })
            .orderBy('payment_month', 'asc');

        const totalPaidFromPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const monthlyTarget = Number(fund.total_amount) / Number(fund.duration);

        // 2. Derive Month-by-Month Status with Carry Forward
        const monthStatusMap = {};
        let carryForward = 0;

        // We calculate for each month in the fund's duration
        // For simplicity, let's assume month 1 is 'start_date' and so on.
        // But the user tracks by YYYY-MM strings.

        // Let's get unique months involved
        const paymentMonths = [...new Set(payments.map(p => p.payment_month))].sort();

        // Actually, let's just use the current total paid to determine overall balance 
        // but store the "month-by-month" status in a conceptual way for reporting.

        const newPendingBalance = Number(fund.total_amount) - totalPaidFromPayments;

        // 3. Update the cache in user_funds
        await db('user_funds')
            .where({ id: enrollment.id })
            .update({
                total_paid: totalPaidFromPayments,
                pending_balance: newPendingBalance > 0 ? newPendingBalance : 0,
                updated_at: db.fn.now()
            });

        return {
            totalPaid: totalPaidFromPayments,
            pendingBalance: newPendingBalance > 0 ? newPendingBalance : 0,
            overdueMonths: this._calculateOverdue(fund, payments, monthlyTarget)
        };
    }

    /**
     * Internal helper to calculate month-by-month tracking and carry-forward.
     */
    _calculateTracking(fund, payments) {
        const monthlyTarget = Number(fund.total_amount) / Number(fund.duration);
        let startDate = new Date(fund.start_date);

        if (isNaN(startDate.getTime())) {
            console.warn(`[BalanceService] Invalid start_date for fund ${fund.id || fund.fund_id}. Defaulting to current date.`);
            startDate = new Date();
        }

        let carryForward = 0;
        const months = [];

        for (let i = 0; i < fund.duration; i++) {
            const currentMonthDate = new Date(startDate);
            currentMonthDate.setMonth(startDate.getMonth() + i);
            const monthStr = currentMonthDate.toISOString().slice(0, 7);

            const monthPayments = payments.filter(p => p.payment_month === monthStr);
            const paidThisMonth = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

            const totalAvailable = paidThisMonth + carryForward;
            let status = 'Pending';
            let remainingCarry = 0;

            if (totalAvailable >= monthlyTarget) {
                status = 'Completed';
                remainingCarry = totalAvailable - monthlyTarget;
            } else if (totalAvailable > 0) {
                status = 'Partial';
                remainingCarry = 0;
            }

            months.push({
                month: monthStr,
                paid: paidThisMonth,
                carryIn: carryForward,
                total: totalAvailable,
                status,
                balance: Math.max(0, monthlyTarget - totalAvailable)
            });

            carryForward = remainingCarry;
        }

        return { months, carryForward, monthlyTarget };
    }

    /**
     * Calculates the balance specifically for the current calendar month.
     */
    async getCurrentMonthBalance(userId, fundId) {
        const fund = await db('funds').where({ id: fundId }).first();
        const enrollment = await db('user_funds').where({ user_id: userId, fund_id: fundId }).first();
        if (!fund || !enrollment) return null;

        const payments = await db('payments')
            .where({ user_id: userId, fund_id: fundId })
            .orderBy('payment_month', 'asc');

        const { months, monthlyTarget } = this._calculateTracking(fund, payments);
        const now = new Date();
        const currentMonthStr = now.toISOString().slice(0, 7);

        const currentMonthData = months.find(m => m.month === currentMonthStr) || {
            paid: 0,
            balance: monthlyTarget,
            status: 'Not Started',
            month: currentMonthStr
        };

        // Dynamic Weekly/Daily Recommendation
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-indexed
        const weeksInMonth = this._getWeeksInMonth(year, month);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        return {
            ...currentMonthData,
            monthlyTarget,
            weeksInMonth,
            daysInMonth,
            recommendedWeekly: (currentMonthData.balance / weeksInMonth).toFixed(2),
            recommendedDaily: (currentMonthData.balance / daysInMonth).toFixed(2),
            paymentSchedule: enrollment.payment_schedule
        };
    }

    /**
     * Calculates number of calendar weeks in a month.
     */
    _getWeeksInMonth(year, month) {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const startDay = firstDayOfMonth.getDay();
        const daysCount = lastDayOfMonth.getDate();

        return Math.ceil((daysCount + startDay) / 7);
    }

    /**
     * Internal logic to calculate how many months are currently overdue.
     */
    _calculateOverdue(fund, payments, monthlyTarget) {
        const startDate = new Date(fund.start_date);
        const today = new Date();

        // Calculate how many months have passed since start_date
        let monthsPassed = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth()) + 1;
        monthsPassed = Math.min(monthsPassed, fund.duration);

        const totalExpectedByNow = monthsPassed * monthlyTarget;
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        const shortfall = totalExpectedByNow - totalPaid;
        if (shortfall <= 0) return 0;

        return Math.ceil(shortfall / monthlyTarget);
    }
}

module.exports = new BalanceService();
