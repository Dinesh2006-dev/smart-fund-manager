import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AdminUserReport = () => {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('user_id');
    const fundId = searchParams.get('fund_id');
    const navigate = useNavigate();

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            if (!userId) {
                setError('User ID is missing');
                setLoading(false);
                return;
            }

            try {
                let url = `/users/${userId}/report`;
                if (fundId) url += `?fund_id=${fundId}`;

                // Note: The original HTML used a direct API call to /users/:id/report
                // We assume this endpoint exists on the backend.
                // If not, we might need to construct this data from other endpoints, 
                // but we'll try the direct endpoint first as per existing codebase patterns.
                // Looking at server code might be needed if this 404s.
                // For now, mirroring the HTML logic:
                const res = await api.get(url);
                setReportData(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load report data');
                setLoading(false);
            }
        };

        fetchReport();
    }, [userId, fundId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-vh-100 bg-white">
                <div className="container mt-5 text-center">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100">
                <div className="container mt-5">
                    <div className="alert alert-danger">{error}</div>
                    <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
                </div>
            </div>
        );
    }

    if (!reportData) return null;

    const { user, funds, payments } = reportData;
    const totalPaid = funds.reduce((acc, f) => acc + Number(f.total_paid), 0);
    const totalPending = funds.reduce((acc, f) => acc + Number(f.pending_balance), 0);

    return (
        <div className="pb-5">
            <div className="mt-2 animate-fade-in printable-report">
                {/* Controls - Hidden during print */}
                <div className="d-flex justify-content-between align-items-center mb-5 d-print-none animate-fade-in">
                    <button onClick={() => navigate(-1)} className="btn btn-outline-light rounded-pill px-4 fw-bold">
                        <i className="bi bi-arrow-left me-2"></i> Back to Ledger
                    </button>
                    <button onClick={handlePrint} className="btn btn-primary rounded-pill px-4 py-2 fw-bold border-0 shadow-lg" style={{ background: 'var(--grad-blue-vibrant)' }}>
                        <i className="bi bi-printer-fill me-2"></i> Generate Statement
                    </button>
                </div>

                {/* Report Page */}
                <div className="bg-white shadow-2xl p-4 p-md-5 rounded-4 mx-auto animate-fade-in" style={{ minHeight: '297mm', maxWidth: '210mm', color: '#1A1D21' }}>

                    {/* Header */}
                    <div className="border-bottom border-2 border-dark pb-4 mb-5 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <div className="p-3 rounded-4 bg-dark text-white me-3 shadow-sm">
                                <i className="bi bi-bank fs-2"></i>
                            </div>
                            <div>
                                <h2 className="fw-extrabold mb-0" style={{ letterSpacing: '-1px' }}>Smart Fund</h2>
                                <div className="text-secondary small fw-bold text-uppercase tracking-widest">OFFICIAL STATEMENT OF ACCOUNT</div>
                            </div>
                        </div>
                        <div className="text-end">
                            <div className="fw-bold fs-5">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            <div className="text-muted small">Report ID: SF-{userId}-{fundId || 'ALL'}</div>
                        </div>
                    </div>

                    {/* Member Info */}
                    <div className="row mb-5 py-3">
                        <div className="col-7 border-start border-4 border-primary ps-4">
                            <h6 className="text-muted small fw-bold mb-3 text-uppercase tracking-wider">Stakeholder Information</h6>
                            <h3 className="fw-bold mb-1">{user.name}</h3>
                            <div className="text-secondary mb-1 fw-medium">{user.email}</div>
                            <div className="text-secondary">{user.phone || 'No phone linked'}</div>
                        </div>
                        <div className="col-5 text-end pe-4">
                            <h6 className="text-muted small fw-bold mb-3 text-uppercase tracking-wider">Fund Association</h6>
                            <div>
                                {funds.map((f, i) => (
                                    <div key={i} className="mb-2">
                                        <div className="fw-bold text-dark">{f.fund_name}</div>
                                        <div className="small text-muted">Joined: {new Date(f.joined_at).toLocaleDateString()}</div>
                                        {i < funds.length - 1 && <div className="my-2 border-bottom border-light w-50 ms-auto"></div>}
                                    </div>
                                ))}
                                {funds.length === 0 && <div className="text-muted italic">No active fund associations found</div>}
                            </div>
                        </div>
                    </div>

                    {/* Financial Stats */}
                    <div className="row g-4 mb-5">
                        <div className="col-6">
                            <div className="p-4 rounded-4 border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small fw-bold text-uppercase">Total Capital Contributed</span>
                                    <div className="p-2 rounded-circle bg-success bg-opacity-10 text-success"><i className="bi bi-wallet2"></i></div>
                                </div>
                                <h2 className="fw-extrabold mb-0 text-dark">₹{totalPaid.toLocaleString()}</h2>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="p-4 rounded-4 border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small fw-bold text-uppercase">Outstanding Obligations</span>
                                    <div className="p-2 rounded-circle bg-warning bg-opacity-10 text-warning"><i className="bi bi-hourglass-split"></i></div>
                                </div>
                                <h2 className="fw-extrabold mb-0 text-dark">₹{totalPending.toLocaleString()}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="mb-4 d-flex justify-content-between align-items-center">
                        <h5 className="fw-bold mb-0 text-dark">Transaction Ledger</h5>
                        <span className="badge bg-dark text-white rounded-pill px-3 py-2 small">{payments.length} Records</span>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 border-top">
                            <thead className="table-light border-0">
                                <tr>
                                    <th className="py-3 border-0 text-muted small text-uppercase">Date</th>
                                    <th className="py-3 border-0 text-muted small text-uppercase">Fund Identity</th>
                                    <th className="py-3 border-0 text-muted small text-uppercase">Schedule</th>
                                    <th className="py-3 border-0 text-muted small text-uppercase text-end">Amount</th>
                                    <th className="py-3 border-0 text-muted small text-uppercase text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted italic">No transaction history found for the selected period.</td></tr>
                                ) : (
                                    payments.map((p, idx) => (
                                        <tr key={idx} className="border-bottom border-light">
                                            <td className="py-3 text-muted">{new Date(p.payment_date).toLocaleDateString()}</td>
                                            <td className="py-3 fw-bold">{funds.find(f => f.fund_id === p.fund_id)?.fund_name || p.fund_name || 'Unknown Fund'}</td>
                                            <td className="py-3">
                                                <div className="small fw-semibold text-dark mb-1">{p.payment_month || 'N/A'}</div>
                                                <span className="badge bg-light text-muted border text-uppercase" style={{ fontSize: '0.6rem' }}>{p.payment_schedule || 'adhoc'}</span>
                                            </td>
                                            <td className="py-3 text-end fw-extrabold">₹{parseFloat(p.amount).toLocaleString()}</td>
                                            <td className="py-3 text-center">
                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 small">SETTLED</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 pt-5 border-top border-light text-center">
                        <div className="text-muted small mb-1">THIS IS A COMPUTER-GENERATED DOCUMENT. NO SIGNATURE IS REQUIRED.</div>
                        <div className="fw-bold small text-dark tracking-widest">&copy; {new Date().getFullYear()} SMART FUND SAVINGS SYSTEM</div>
                    </div>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        body { background: white !important; margin: 0 !important; padding: 0 !important; }
                        .bg-premium { background: white !important; padding: 0 !important; }
                        .container { max-width: 100% !important; margin: 0 !important; width: 100% !important; padding: 0 !important; }
                        .d-print-none { display: none !important; }
                        .shadow-2xl, .shadow-sm { box-shadow: none !important; }
                        .rounded-4 { border-radius: 0 !important; }
                        .animate-fade-in { animation: none !important; opacity: 1 !important; transform: none !important; }
                        .table-responsive { overflow: visible !important; }
                    }
                    .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                `}
            </style>
        </div>
    );
};

export default AdminUserReport;
