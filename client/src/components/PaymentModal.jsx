import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import confetti from 'canvas-confetti';

const PaymentModal = ({ funds, preSelectedFundId, onClose, onSuccess }) => {
    const [selectedFundId, setSelectedFundId] = useState(preSelectedFundId || (funds[0]?.fund_id || funds[0]?.id) || '');
    // Default to current month YYYY-MM
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const [paymentMonth, setPaymentMonth] = useState(currentMonthStr);
    const [schedule, setSchedule] = useState('monthly');
    const [payFullMonth, setPayFullMonth] = useState(false);
    const [amount, setAmount] = useState(0);
    const [penalty, setPenalty] = useState(0);
    const [mode, setMode] = useState('UPI');
    const [loading, setLoading] = useState(false);
    const [warning, setWarning] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const selectedFund = funds.find(f => (f.fund_id || f.id) == selectedFundId);

    // Calculation Logic
    useEffect(() => {
        if (!selectedFund) return;

        const monthlyTarget = selectedFund.total_amount / selectedFund.duration;
        const totalPaid = parseFloat(selectedFund.total_paid) || 0;

        // Force Monthly if first payment
        if (totalPaid === 0 && schedule !== 'monthly') {
            setSchedule('monthly');
        }

        // Auto-set month to next_due_month if available and we haven't manually changed it (or just always on switch)
        // actually, let's do this in a separate effect dependent on selectedFundId to avoid loops


        // Parse selected month
        const [year, month] = paymentMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const currentDay = today.getDate();
        const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;

        let finalAmount = 0;
        let calcPenalty = 0;
        let warningMsg = '';

        if (payFullMonth) {
            const paidInCurrentInterval = totalPaid % monthlyTarget;
            let remaining = monthlyTarget - paidInCurrentInterval;
            remaining = Math.round(remaining * 100) / 100;
            if (remaining < 1) remaining = monthlyTarget; // Start new month
            finalAmount = remaining;
        } else {
            if (schedule === 'monthly') {
                finalAmount = monthlyTarget;

                // Penalty Logic (Monthly > 10th)
                if (isCurrentMonth && currentDay > 10 && totalPaid > 0) {
                    const daysLate = currentDay - 10;
                    calcPenalty = Math.ceil(monthlyTarget * (0.0025 * daysLate));
                    warningMsg = `Overdue by ${daysLate} days. Late fee: ₹${calcPenalty}`;
                }
            } else if (schedule === 'weekly') {
                const weeksTotal = Math.ceil(daysInMonth / 7);
                const weeklyAmount = Math.ceil(monthlyTarget / weeksTotal);
                finalAmount = weeklyAmount;

                // Weekly Penalty Logic (Simplified for React port to match JS)
                const currentWeekNum = Math.ceil(currentDay / 7);
                const paidWeeks = Math.floor(totalPaid / weeklyAmount);
                const weeksDue = currentWeekNum - 1;

                if (weeksDue > paidWeeks) {
                    const firstUnpaidWeekDeadline = (paidWeeks + 1) * 7;
                    let daysLate = currentDay - firstUnpaidWeekDeadline;
                    if (daysLate < 1) daysLate = 1;
                    calcPenalty = Math.ceil(weeklyAmount * (0.0075 * daysLate));
                    warningMsg = `Weekly payment overdue. Late fee: ₹${calcPenalty}`;
                }
            } else if (schedule === 'daily') {
                const dailyAmount = Math.ceil(monthlyTarget / daysInMonth);
                finalAmount = dailyAmount;
            }
        }

        setAmount(finalAmount);
        setPenalty(calcPenalty);
        setWarning(warningMsg);

    }, [selectedFundId, paymentMonth, schedule, payFullMonth, funds]);

    const [lockMessage, setLockMessage] = useState('');

    // Check & Lock Payment Mode for Selected Month
    useEffect(() => {
        const checkMode = async () => {
            if (!selectedFundId || !paymentMonth) return;

            // Don't check for first payment (handled by other effect)
            if (parseFloat(selectedFund?.total_paid || 0) === 0) return;

            try {
                const res = await api.get(`/payments/check-mode?fund_id=${selectedFundId}&payment_month=${paymentMonth}`);
                if (res.data.mode) {
                    setSchedule(res.data.mode);
                    setLockMessage(`Mode locked to ${res.data.mode.toUpperCase()} for this month.`);
                } else {
                    setLockMessage('');
                }
            } catch (err) {
                console.error("Failed to check payment mode:", err);
            }
        };
        checkMode();
    }, [selectedFundId, paymentMonth, selectedFund]);

    // Update Month when Fund Changes
    useEffect(() => {
        if (selectedFund?.next_due_month) {
            setPaymentMonth(selectedFund.next_due_month);
        }
    }, [selectedFundId, funds]);

    const [walletBalance, setWalletBalance] = useState(0);

    // Fetch Wallet Balance
    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const res = await api.get('/wallet/balance');
                setWalletBalance(res.data.balance);
            } catch (err) {
                console.error("Failed to fetch wallet balance", err);
            }
        };
        fetchWallet();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            await api.post('/payments', {
                fund_id: selectedFundId,
                fund_name: selectedFund?.name, // Pass name for wallet history
                amount: amount,
                penalty: penalty,
                payment_month: paymentMonth,
                payment_schedule: schedule,
                mode: mode,
                payment_date: new Date().toISOString().split('T')[0]
            });

            // Confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            onSuccess();
            onClose();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal show d-block animate-fade-in" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content glass-card border-0 shadow-2xl text-white">
                    <div className="modal-header border-bottom border-white border-opacity-10 py-4">
                        <div className="d-flex align-items-center">
                            <div className="p-2 rounded-3 glass-bg-medium me-3" style={{ color: '#00E5FF' }}>
                                <i className="bi bi-wallet2 fs-4"></i>
                            </div>
                            <h4 className="modal-title fw-bold mb-0">Deposit Money</h4>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label text-white-50 small fw-bold tracking-wider">SELECT FUND</label>
                                <select
                                    className="form-select glass-bg-low text-white border-white border-opacity-10 rounded-3 py-2 cursor-pointer"
                                    value={selectedFundId}
                                    onChange={(e) => setSelectedFundId(e.target.value)}
                                    required
                                    style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3e%3cpath fill=%27none%27 stroke=%27%23ffffff80%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m2 5 6 6 6-6%27/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '16px 12px' }}
                                >
                                    {funds.map(f => (
                                        <option key={f.fund_id || f.id} value={f.fund_id || f.id} style={{ background: '#1A1D21', color: 'white' }}>
                                            {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label text-white-50 small fw-bold tracking-wider">MONTH</label>
                                    <div className="position-relative">
                                        <input
                                            type={selectedFund?.next_due_month ? "text" : "month"}
                                            className="form-control glass-bg-low text-white border-white border-opacity-10 rounded-3 py-2"
                                            value={
                                                selectedFund?.next_due_month
                                                    ? new Date(parseInt(paymentMonth.split('-')[0]), parseInt(paymentMonth.split('-')[1]) - 1).toLocaleDateString('default', { month: 'long', year: 'numeric' })
                                                    : paymentMonth
                                            }
                                            onChange={(e) => !selectedFund?.next_due_month && setPaymentMonth(e.target.value)}
                                            readOnly={!!selectedFund?.next_due_month}
                                            required
                                        />
                                        {selectedFund?.next_due_month && (
                                            <i className="bi bi-lock-fill position-absolute end-0 top-50 translate-middle-y me-3 text-white-50" style={{ fontSize: '0.8rem' }}></i>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-white-50 small fw-bold tracking-wider">PLAN</label>
                                    <select
                                        className="form-select glass-bg-low text-white border-white border-opacity-10 rounded-3 py-2"
                                        value={schedule}
                                        onChange={(e) => {
                                            setSchedule(e.target.value);
                                            if (e.target.value === 'monthly') setPayFullMonth(false);
                                        }}
                                        disabled={parseFloat(selectedFund?.total_paid || 0) === 0 || !!lockMessage}
                                        style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3e%3cpath fill=%27none%27 stroke=%27%23ffffff80%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m2 5 6 6 6-6%27/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '16px 12px' }}
                                    >
                                        <option value="monthly" style={{ background: '#1A1D21' }}>Monthly</option>
                                        <option value="weekly" style={{ background: '#1A1D21' }}>Weekly</option>
                                        <option value="daily" style={{ background: '#1A1D21' }}>Daily</option>
                                    </select>
                                </div>
                            </div>

                            {/* Info Badges */}
                            {(parseFloat(selectedFund?.total_paid || 0) === 0 || lockMessage) && (
                                <div className="p-3 rounded-4 glass-bg-low border border-white border-opacity-10 mb-4 animate-fade-in">
                                    <div className="d-flex align-items-center small">
                                        <i className="bi bi-info-circle-fill me-2" style={{ color: '#00E5FF' }}></i>
                                        <span className="text-white-50">
                                            {parseFloat(selectedFund?.total_paid || 0) === 0
                                                ? "Initial deposits must be paid monthly."
                                                : lockMessage}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {schedule !== 'monthly' && (
                                <div className="mb-4 animate-fade-in">
                                    <div className="form-check glass-bg-low p-3 rounded-4 border border-white border-opacity-5 cursor-pointer hover-bg-opacity-10 transition-all">
                                        <div className="ps-4">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="payFullMonth"
                                                checked={payFullMonth}
                                                onChange={(e) => setPayFullMonth(e.target.checked)}
                                                style={{ backgroundColor: payFullMonth ? 'var(--accent)' : 'transparent', borderColor: 'rgba(255,255,255,0.2)' }}
                                            />
                                            <label className="form-check-label text-white small cursor-pointer" htmlFor="payFullMonth">Pay Clear Month Balance</label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <div className="p-4 rounded-4 shadow-sm" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="text-white-50 small fw-bold tracking-wider mb-0">TOTAL AMOUNT</label>
                                        <span className="badge bg-white bg-opacity-10 text-white-50" style={{ fontSize: '0.65rem' }}>AUTO-CALCULATED</span>
                                    </div>
                                    <div className="d-flex align-items-baseline">
                                        <span className="h1 fw-extrabold text-white mb-0">₹{(amount + penalty).toLocaleString()}</span>
                                        {penalty > 0 && <span className="ms-2 text-danger small">incl. late fee</span>}
                                    </div>
                                    {warning && (
                                        <div className="mt-2 text-danger small d-flex align-items-center">
                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>{warning}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-white-50 small fw-bold tracking-wider d-flex justify-content-between">
                                    PAYMENT MODE
                                    {mode === 'Wallet' && <span className="text-white fw-bold">Balance: ₹{walletBalance.toLocaleString()}</span>}
                                </label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {['UPI', 'Wallet', 'Cash', 'Bank Transfer'].map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            className={`btn flex-fill py-2 rounded-3 border-0 transition-all ${mode === m ? 'shadow-glow-success' : 'glass-bg-low text-white-50'}`}
                                            onClick={() => setMode(m)}
                                            style={mode === m ? { background: 'var(--grad-blue-vibrant)', color: 'white', fontWeight: 'bold' } : {}}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {errorMessage && (
                                <div className="alert alert-danger bg-danger bg-opacity-10 text-danger border-0 rounded-4 p-3 small mb-4 animate-shake">
                                    <i className="bi bi-exclamation-circle-fill me-2"></i>
                                    {errorMessage}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-4 shadow-lg border-0 mt-2"
                                style={{ background: 'var(--grad-blue-vibrant)' }}
                                disabled={loading}>
                                {loading ? (
                                    <span><span className="spinner-border spinner-border-sm me-2" role="status"></span>Finalizing...</span>
                                ) : 'Complete Transaction'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
