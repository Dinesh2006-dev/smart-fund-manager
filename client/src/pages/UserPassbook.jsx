import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const UserPassbook = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await api.get('/payments');
                setPayments(res.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load passbook.');
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="pb-5">
            <div className="mt-2 animate-fade-in">
                <div className="d-flex justify-content-between align-items-end mb-5 no-print">
                    <div>
                        <h1 className="fw-bold mb-1 text-white display-5">Financial Passbook</h1>
                        <p className="text-white-50 mb-0 fs-5">Your complete history of contributions and growth</p>
                    </div>
                    <button className="btn btn-primary rounded-pill px-4 py-2 d-none d-md-block shadow-lg" onClick={handlePrint}>
                        <i className="bi bi-file-earmark-pdf-fill me-2"></i>Export History
                    </button>
                </div>

                <div className="card glass-card border-0 p-4 shadow-2xl">
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger bg-danger bg-opacity-10 text-danger border-0 rounded-4">{error}</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle" style={{ color: 'white' }}>
                                    <thead>
                                        <tr>
                                            <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Date</th>
                                            <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Month/Freq</th>
                                            <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Fund Details</th>
                                            <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Amount</th>
                                            <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Status</th>
                                            <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-0">
                                        {payments.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center p-5 text-white-50">
                                                    No transactions found in your history.
                                                </td>
                                            </tr>
                                        ) : (
                                            payments.map((p) => (
                                                <tr key={p.id} className="border-bottom border-white border-opacity-5">
                                                    <td className="text-white-50 small">
                                                        {new Date(p.payment_date).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold small text-white">{p.payment_month || '-'}</div>
                                                        <span className="badge bg-white bg-opacity-10 text-white" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>
                                                            {(p.payment_schedule || 'monthly').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold text-white">{p.fund_name}</div>
                                                        <div className="small text-white-50">ID: #{p.fund_id}</div>
                                                    </td>
                                                    <td className="fw-bold" style={{ color: '#00FFAD' }}>+ ₹{p.amount.toLocaleString()}</td>
                                                    <td><span className="badge bg-success bg-opacity-20 text-success rounded-pill px-3 py-2">Success</span></td>
                                                    <td className="text-white-50 small">{p.notes || '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPassbook;
