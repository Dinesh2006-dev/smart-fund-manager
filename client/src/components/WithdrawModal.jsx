import React, { useState } from 'react';
import api from '../api/axios';

const WithdrawModal = ({ fund, onCancel, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!fund) return null;

    // Full Withdrawal Logic
    const fullAmount = Number(fund.total_paid);
    const withdrawFee = (fullAmount * 0.10).toFixed(2);
    const finalPayout = (fullAmount - Number(withdrawFee)).toFixed(2);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        try {
            setLoading(true);
            setError('');
            const res = await api.post('/funds/withdraw', {
                fund_id: fund.fund_id,
                amount: fullAmount // Always full amount
            });

            onSuccess(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Withdrawal failed');
        } finally {
            setLoading(false);
        }
    };

    // Solid Styling Pattern
    const backdropStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
    };

    const modalBoxStyle = {
        backgroundColor: '#0F172A',
        borderRadius: '30px',
        width: '90%',
        maxWidth: '420px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
        zIndex: 2001
    };

    return (
        <div style={backdropStyle} onClick={onCancel}>
            <div
                className="animate-modal-in"
                style={modalBoxStyle}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Corner Design */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '110px',
                    height: '110px',
                    background: 'var(--grad-orange-red)',
                    clipPath: 'polygon(100% 0, 100% 45%, 55% 0)',
                    zIndex: 1
                }}></div>

                <div className="modal-header border-0 pt-5 px-4 pb-0 d-flex flex-column align-items-center text-center position-relative" style={{ zIndex: 3 }}>
                    <div className="mb-4 d-flex align-items-center justify-content-center" style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '22px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid #EF4444',
                        transform: 'rotate(-5deg)',
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
                    }}>
                        <i className="bi bi-wallet2 fs-2 text-danger" style={{ transform: 'rotate(5deg)' }}></i>
                    </div>
                    <h3 className="modal-title fw-bold text-white mb-2">Full Withdrawal</h3>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '25px',
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.2rem',
                            zIndex: 10,
                            cursor: 'pointer',
                            opacity: 0.7
                        }}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                    <p className="text-white-50 small mt-1 px-4">Withdraw your entire principal investment from this fund.</p>
                </div>

                <div className="modal-body px-4 py-4 position-relative" style={{ zIndex: 3 }}>
                    <div className="p-4 rounded-4 mb-4 text-center d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="text-white-50 small text-uppercase fw-bold mb-1 tracking-wider">Withdrawing Principal</div>
                        <div className="display-5 fw-extrabold text-white">₹{fullAmount.toLocaleString()}</div>
                    </div>

                    <div className="bg-black bg-opacity-40 p-4 rounded-4 mb-4 border border-white border-opacity-5">
                        <div className="d-flex justify-content-between mb-3 align-items-center">
                            <span className="text-white-50">Emergeny Fee (2%)</span>
                            <span className="text-danger fw-bold fs-5">- ₹{withdrawFee}</span>
                        </div>
                        <hr className="border-white border-opacity-10 my-3" />
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-white-50 fw-bold">Total Payout</span>
                            <div className="text-end">
                                <span className="text-success display-6 fw-extrabold">₹{finalPayout}</span>
                                <div className="text-success small fw-bold mt-1 text-uppercase tracking-tighter">Settlement Amount</div>
                            </div>
                        </div>
                    </div>

                    {error && <div className="alert alert-danger py-2 rounded-3 small mb-3 border-0 bg-danger bg-opacity-20 text-danger text-center">{error}</div>}

                    <button
                        type="button"
                        className="btn w-100 py-3 rounded-pill fw-bold text-white shadow-lg border-0 transition-all mb-2"
                        disabled={loading || fullAmount <= 0}
                        onClick={handleSubmit}
                        style={{
                            background: 'var(--grad-orange-red)',
                            opacity: (loading || fullAmount <= 0) ? 0.5 : 1,
                            fontSize: '1.2rem',
                            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.5)'
                        }}
                    >
                        {loading ? 'Processing Withdrawal...' : 'Withdraw Everything'}
                    </button>
                    <p className="text-center text-white-50 small mt-4 px-2 mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                        <i className="bi bi-shield-lock me-1"></i>
                        Note: Once confirmed, your investment in <strong>{fund.name}</strong> will be debited and your enrollment will be updated.
                    </p>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes modalIn {
                    from { transform: translateY(30px) scale(0.96); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                .animate-modal-in {
                    animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .transition-all { transition: all 0.25s ease !important; }
            `}} />
        </div>
    );
};

export default WithdrawModal;
