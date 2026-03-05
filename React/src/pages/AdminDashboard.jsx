import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
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
            <div className="min-vh-100 bg-premium">
                <Navbar />
                <div className="container mt-5 text-center">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 bg-premium">
                <Navbar />
                <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>
            </div>
        );
    }

    return (
        <div className="bg-premium min-vh-100 pb-5">
            <Navbar />
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <h1 className="fw-bold mb-1">System Overview</h1>
                        <p className="text-muted mb-0">Monitor your wealth management operations</p>
                    </div>
                    <button className="btn btn-primary d-none d-md-block" onClick={handleExport}>
                        <i className="bi bi-download me-2"></i>Generate Report
                    </button>
                </div>

                <div className="row g-4 mb-5">
                    {/* Stats Cards */}
                    <div className="col-md-3">
                        <div className="card glass-card border-0">
                            <div className="card-body p-4">
                                <div className="stat-icon bg-primary-light text-primary" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
                                    <i className="bi bi-people"></i>
                                </div>
                                <div className="text-muted small fw-bold text-uppercase tracking-wider">Total Members</div>
                                <h2 className="fw-bold mb-0">{stats?.totalUsers || 0}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card glass-card border-0">
                            <div className="card-body p-4">
                                <div className="stat-icon bg-success-subtle text-success" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
                                    <i className="bi bi-cash-stack"></i>
                                </div>
                                <div className="text-muted small fw-bold text-uppercase tracking-wider">Collected</div>
                                <h2 className="fw-bold mb-0 text-success">₹{stats?.totalCollected?.toLocaleString() || 0}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card glass-card border-0">
                            <div className="card-body p-4">
                                <div className="stat-icon bg-danger-subtle text-danger" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
                                    <i className="bi bi-exclamation-circle"></i>
                                </div>
                                <div className="text-muted small fw-bold text-uppercase tracking-wider">Pending</div>
                                <h2 className="fw-bold mb-0 text-danger">₹{stats?.totalPending?.toLocaleString() || 0}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card glass-card border-0">
                            <div className="card-body p-4">
                                <div className="stat-icon bg-info-subtle text-info" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
                                    <i className="bi bi-wallet2"></i>
                                </div>
                                <div className="text-muted small fw-bold text-uppercase tracking-wider">Active Funds</div>
                                <h2 className="fw-bold mb-0">{stats?.totalFunds || 0}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-5">
                    <div className="col-12">
                        <div className="card glass-card border-0 p-3">
                            <div className="card-body">
                                <h5 className="fw-bold mb-4"><i className="bi bi-grid-fill me-2 text-primary"></i>Fund Membership Tracking</h5>
                                <div className="row g-3">
                                    {stats?.fundSummaries?.map((fs, index) => (
                                        <div className="col-md-3" key={index}>
                                            <div className="p-3 border rounded-4 bg-white shadow-sm h-100 transition-all hover-translate-y">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="small text-muted mb-1 text-truncate" style={{ maxWidth: '120px' }} title={fs.name}>{fs.name}</div>
                                                        <div className="h5 fw-bold mb-0">{fs.count} <small className="fw-normal text-muted fs-6">Members</small></div>
                                                    </div>
                                                    <div className="text-primary fs-4 bg-primary-light p-2 rounded-3">
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
                        <div className="card glass-card border-0 p-3">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold mb-0">Recent Activity</h5>
                                    {/* Link to full payments page later */}
                                    <button className="btn btn-link btn-sm text-decoration-none p-0">View All</button>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover smart-table align-middle">
                                        <thead>
                                            <tr>
                                                <th className="border-0 text-muted small text-uppercase">Date</th>
                                                <th className="border-0 text-muted small text-uppercase">User</th>
                                                <th className="border-0 text-muted small text-uppercase">Fund</th>
                                                <th className="border-0 text-muted small text-uppercase">Amount</th>
                                                <th className="border-0 text-muted small text-uppercase text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentPayments.map((p, index) => (
                                                <tr key={index}>
                                                    <td className="text-muted small">{new Date(p.payment_date).toLocaleDateString()}</td>
                                                    <td className="fw-bold">{p.user_name}</td>
                                                    <td className="text-primary fw-medium">{p.fund_name}</td>
                                                    <td className="fw-bold">₹{p.amount.toLocaleString()}</td>
                                                    <td className="text-center"><span className="badge bg-success-subtle text-success rounded-pill px-3">Success</span></td>
                                                </tr>
                                            ))}
                                            {recentPayments.length === 0 && (
                                                <tr><td colSpan="5" className="text-center text-muted">No recent payments found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card glass-card border-0 p-3 mb-4">
                            <div className="card-body">
                                <h5 className="fw-bold mb-4">Institutional Actions</h5>
                                <div className="d-grid gap-3">
                                    <Link to="/admin/funds" className="btn btn-primary py-3">
                                        <i className="bi bi-plus-circle me-2"></i>New Fund Structure
                                    </Link>
                                    <Link to="/admin/users" className="btn btn-outline-dark py-3">
                                        <i className="bi bi-person-plus me-2"></i>Onboard Member
                                    </Link>
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
