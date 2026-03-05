import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const WalletPage = () => {
    const { token } = useAuth();
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [balanceRes, historyRes] = await Promise.all([
                api.get('/wallet/balance'),
                api.get('/wallet/history')
            ]);
            setBalance(balanceRes.data.balance);
            setHistory(historyRes.data);
        } catch (error) {
            console.error('Failed to fetch wallet data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return;

        try {
            setActionLoading(true);
            await api.post('/wallet/deposit', { amount: Number(amount) });
            setAmount('');
            await fetchData();
            alert('Deposit successful!');
        } catch (error) {
            alert(error.response?.data?.message || 'Deposit failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-vh-100">
            <div className="text-center pt-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        </div>
    );

    return (
        <div className="pb-5">
            <div className="mt-2">
                <div className="row g-4">
                    {/* Balance Card */}
                    <div className="col-md-5">
                        <div className="card glass-card border-0 p-4 mb-4 shadow-2xl overflow-hidden position-relative">
                            <div className="position-absolute top-0 end-0 p-3 opacity-10" style={{ color: '#00E5FF' }}>
                                <i className="bi bi-wallet2 display-1"></i>
                            </div>
                            <div className="card-body p-0 position-relative">
                                <h6 className="text-white-50 text-uppercase tracking-widest fw-bold small mb-2">Internal Capital</h6>
                                <h1 className="text-white fw-extrabold display-4 mb-4">₹{Number(balance).toLocaleString()}</h1>

                                <form onSubmit={handleDeposit} className="mt-5">
                                    <label className="text-white-50 small fw-bold mb-2">QUICK DEPOSIT</label>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text glass-bg-medium border-white border-opacity-10 text-white">₹</span>
                                        <input
                                            type="number"
                                            className="form-control glass-bg-low text-white border-white border-opacity-10"
                                            placeholder="Enter amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        />
                                        <button
                                            className="btn btn-primary px-4 fw-bold shadow-glow-success"
                                            type="submit"
                                            disabled={actionLoading}
                                            style={{ background: 'var(--grad-green-blue)' }}
                                        >
                                            {actionLoading ? '...' : 'Add Cash'}
                                        </button>
                                    </div>
                                    <div className="text-white-50 x-small">Funds available immediately for reinvestment.</div>
                                </form>
                            </div>
                        </div>

                        <div className="card glass-card border-0 p-4 glass-bg-low">
                            <h5 className="text-white fw-bold mb-3">Wallet Synergy</h5>
                            <p className="text-white-50 small">
                                Use your internal wallet to avoid external transaction fees and bank delays. Funds can be used to pay any fund contribution instantly.
                            </p>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="col-md-7">
                        <div className="card glass-card border-0 p-4 shadow-2xl h-100">
                            <h5 className="text-white fw-bold mb-4 d-flex align-items-center">
                                <i className="bi bi-clock-history me-2" style={{ color: '#FFAB00' }}></i>
                                Transaction Ledger
                            </h5>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ color: 'white' }}>
                                    <thead>
                                        <tr className="border-bottom border-white border-opacity-10">
                                            <th className="py-3 border-0 text-white-50 small text-uppercase">Timeline</th>
                                            <th className="py-3 border-0 text-white-50 small text-uppercase">Description</th>
                                            <th className="py-3 border-0 text-white-50 small text-uppercase text-end pe-3">Volume</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.length === 0 ? (
                                            <tr><td colSpan="3" className="text-center py-5 text-white-50">No operational history found.</td></tr>
                                        ) : (
                                            history.map((t) => (
                                                <tr key={t.id} className="border-bottom border-white border-opacity-5">
                                                    <td className="text-white-50 small">
                                                        {new Date(t.transaction_date).toLocaleDateString()}<br />
                                                        {new Date(t.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="fw-bold">
                                                        {t.description}
                                                        <div className="small text-white-50 x-small text-uppercase">{t.type}</div>
                                                    </td>
                                                    <td className={`text-end pe-3 fw-bold fs-5 ${t.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                                                        {t.amount >= 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
