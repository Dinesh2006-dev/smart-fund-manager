import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const JoinFundModal = ({ fund, onClose, onJoinSuccess }) => {
    const [terms, setTerms] = useState('Loading terms...');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (fund?.terms) {
            setTerms(fund.terms);
        } else {
            setTerms("No specific terms provided for this fund.");
        }
    }, [fund]);

    // Calculate Catch-up Logic
    const startDate = new Date(fund.start_date);
    const today = new Date();
    let monthsPassed = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
    monthsPassed = Math.max(0, Math.min(monthsPassed, fund.duration));

    const monthlyInstallment = Number(fund.total_amount) / Number(fund.duration);
    const catchupAmount = monthsPassed * monthlyInstallment;

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!agreed) return;

        setLoading(true);
        try {
            await api.post('/funds/join', {
                fund_id: fund.id,
                payment_schedule: 'monthly'
            });
            onJoinSuccess();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to join fund');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal show d-block animate-fade-in" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content glass-card border-0 shadow-2xl text-white">
                    <div className="modal-header border-bottom border-white border-opacity-10 py-4">
                        <h4 className="modal-title fw-bold">Enroll in {fund?.name}</h4>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <form onSubmit={handleJoin}>
                            <div className="mb-4">
                                <label className="form-label text-white-50 small fw-bold tracking-wider">INVESTMENT TERMS</label>
                                <div className="form-control bg-white bg-opacity-5 text-white-50 border-white border-opacity-10 rounded-4" style={{ height: '180px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '0.9em' }}>
                                    {terms}
                                </div>
                            </div>
                            {catchupAmount > 0 && (
                                <div className="mb-4 p-3 rounded-4 bg-warning bg-opacity-10 border border-warning border-opacity-20 animate-fade-in">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-warning small fw-bold text-uppercase tracking-wider">Catch-up Payment Required</span>
                                        <span className="badge bg-warning text-dark rounded-pill">{monthsPassed} Months Missed</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-baseline">
                                        <h3 className="text-white fw-bold mb-0">₹{catchupAmount.toLocaleString()}</h3>
                                        <span className="text-white-50 small">Opening Investment</span>
                                    </div>
                                    <p className="text-white-50 x-small mt-2 mb-0">
                                        Since this fund started on {new Date(fund.start_date).toLocaleDateString()}, you must pay for {monthsPassed} missed installments to stay synchronized with other members.
                                    </p>
                                </div>
                            )}

                            <div className="mb-4 form-check bg-white bg-opacity-5 p-3 rounded-4 border border-white border-opacity-5">
                                <div className="ps-4">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="agreeTerms"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        style={{ backgroundColor: agreed ? 'var(--accent)' : 'transparent', borderColor: 'rgba(255,255,255,0.2)' }}
                                    />
                                    <label className="form-check-label small text-white" htmlFor="agreeTerms">
                                        I have read and agree to the Investment Terms & Conditions
                                    </label>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-4 shadow-lg border-0"
                                style={{ background: 'var(--grad-blue-vibrant)' }}
                                disabled={!agreed || loading}>
                                {loading ? (
                                    <span><span className="spinner-border spinner-border-sm me-2" role="status"></span>Processing...</span>
                                ) : 'Join Fund & Start Investing'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinFundModal;
