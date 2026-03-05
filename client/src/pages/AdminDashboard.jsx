import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const statsRes = await api.get('/dashboard/admin/stats');
                setStats(statsRes.data);

                const paymentsRes = await api.get('/payments');
                setRecentPayments(paymentsRes.data.slice(0, 5)); // Limit to 5

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load admin dashboard.');
                setLoading(false);
            }
        };

        if (token) {
            fetchDashboard();
        }
    }, [token]);

    const handleExport = () => {
        alert('Export logic would generate a CSV/PDF here.');
    };

    if (loading) {
        return (
            <div className="min-vh-100">
                <div className="text-center pt-5">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100">
                <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>
            </div>
        );
    }

    return (
        <div className="pb-5">
            <div className="mt-2">
                <div className="d-flex justify-content-between align-items-end mb-5 animate-fade-in">
                    <div>
                        <h1 className="fw-bold mb-1 text-white display-4" style={{ letterSpacing: '-1.5px' }}>System Overview</h1>
                        <p className="text-white-50 fs-5 mb-0">Operational control for community wealth management</p>
                    </div>
                    <button className="btn btn-outline-light rounded-pill px-4 py-2 d-none d-md-block shadow-lg" onClick={handleExport} style={{ borderWidth: '2px' }}>
                        <i className="bi bi-download me-2"></i>Export System Data
                    </button>
                </div>

                <div className="row g-4 mb-5">
                    {/* Stats Cards */}
                    <div className="col-md-3">
                        <div className="card glass-card border-0 overflow-hidden">
                            <div className="card-body p-4 position-relative">
                                <div className="stat-icon mb-3 shadow-lg" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', background: 'var(--grad-purple-blue)', color: 'white' }}>
                                    <i className="bi bi-people"></i>
                                </div>
                                <div className="text-white-50 small fw-bold text-uppercase tracking-wider">Total Members</div>
                                <h2 className="fw-extrabold text-white mb-0 mt-1">{stats?.totalUsers || 0}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card glass-card border-0 overflow-hidden">
                            <div className="card-body p-4 position-relative">
                                <div className="stat-icon mb-3 shadow-lg" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', background: 'var(--grad-green-blue)', color: 'white' }}>
                                    <i className="bi bi-cash-stack"></i>
                                </div>
                                <div className="text-white-50 small fw-bold text-uppercase tracking-wider">Collected</div>
                                <h2 className="fw-extrabold text-white mb-0 mt-1">₹{stats?.totalCollected?.toLocaleString() || 0}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card glass-card border-0 overflow-hidden">
                            <div className="card-body p-4 position-relative">
                                <div className="stat-icon mb-3 shadow-lg" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', background: 'var(--grad-orange-red)', color: 'white' }}>
                                    <i className="bi bi-exclamation-circle"></i>
                                </div>
                                <div className="text-white-50 small fw-bold text-uppercase tracking-wider">Pending</div>
                                <h2 className="fw-extrabold text-white mb-0 mt-1">₹{stats?.totalPending?.toLocaleString() || 0}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card glass-card border-0 overflow-hidden">
                            <div className="card-body p-4 position-relative">
                                <div className="stat-icon mb-3 shadow-lg" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', background: 'var(--grad-cyan-pink)', color: 'white' }}>
                                    <i className="bi bi-wallet2"></i>
                                </div>
                                <div className="text-white-50 small fw-bold text-uppercase tracking-wider">Active Funds</div>
                                <h2 className="fw-extrabold text-white mb-0 mt-1">{stats?.totalFunds || 0}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-5">
                    <div className="col-12">
                        <div className="card glass-card border-0 p-4 shadow-2xl">
                            <div className="card-body p-0">
                                <h5 className="fw-bold mb-4 text-white"><i className="bi bi-grid-fill me-2" style={{ color: '#00E5FF' }}></i>Fund Membership Tracking</h5>
                                <div className="row g-4">
                                    {stats?.fundSummaries?.map((fs, index) => (
                                        <div className="col-md-3" key={index}>
                                            <div className="p-4 border border-white border-opacity-10 rounded-4 glass-bg-low h-100 transition-all hover-translate-y">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="small text-white-50 mb-1 text-truncate" style={{ maxWidth: '120px' }} title={fs.name}>{fs.name}</div>
                                                        <div className="h4 fw-bold text-white mb-0">{fs.count} <small className="fw-normal text-white-50 fs-6">Members</small></div>
                                                    </div>
                                                    <div className="fs-4 glass-bg-medium p-3 rounded-4 shadow-sm" style={{ color: '#00E5FF' }}>
                                                        <i className="bi bi-people-fill"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    <div className="col-md-8">
                        <div className="card glass-card border-0 p-4 shadow-2xl h-100">
                            <div className="card-body p-0">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold mb-0 text-white">Recent Transactions</h5>
                                    <button className="btn btn-link text-white text-opacity-50 text-decoration-none p-0 small">View History</button>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle" style={{ color: 'white' }}>
                                        <thead>
                                            <tr>
                                                <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Date</th>
                                                <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Member</th>
                                                <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Fund</th>
                                                <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3 text-end">Amount</th>
                                                <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentPayments.map((p, index) => (
                                                <tr key={index} className="border-bottom border-white border-opacity-5">
                                                    <td className="text-white-50 small">{new Date(p.payment_date).toLocaleDateString()}</td>
                                                    <td className="fw-bold text-white">{p.user_name}</td>
                                                    <td className="fw-medium text-white">{p.fund_name}</td>
                                                    <td className="fw-bold text-end text-white">₹{p.amount.toLocaleString()}</td>
                                                    <td className="text-center"><span className="badge bg-success bg-opacity-20 text-success rounded-pill px-3 py-2">Success</span></td>
                                                </tr>
                                            ))}
                                            {recentPayments.length === 0 && (
                                                <tr><td colSpan="5" className="text-center py-5 text-white-50">No recent activity detected.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card glass-card border-0 p-4 shadow-2xl">
                            <div className="card-body p-0">
                                <h5 className="fw-bold mb-4 text-white">Quick Management</h5>
                                <div className="d-grid gap-4">
                                    <Link to="/admin/funds" className="btn btn-primary py-3 fw-bold rounded-4 shadow-lg border-0" style={{ background: 'var(--grad-blue-vibrant)' }}>
                                        <i className="bi bi-grid-fill me-2"></i>Manage Funds
                                    </Link>
                                    <Link to="/admin/users" className="btn btn-outline-light py-3 fw-bold rounded-4 shadow-sm" style={{ borderWidth: '2px' }}>
                                        <i className="bi bi-people-fill me-2"></i>Member Control
                                    </Link>
                                    <div className="p-4 rounded-4 glass-bg-low border border-white border-opacity-10 mt-2">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="p-2 rounded-3 glass-bg-medium me-3" style={{ color: '#FFD700' }}><i className="bi bi-shield-check fs-4"></i></div>
                                            <div className="text-white fw-bold">System Status</div>
                                        </div>
                                        <div className="small text-white-50">All systems operational. End-to-end encryption is active.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
