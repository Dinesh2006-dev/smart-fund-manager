import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const AdminTracking = () => {
    const { id } = useParams();
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTracking = async () => {
            try {
                setLoading(true);
                // The backend endpoint used in original HTML was /funds/:id/tracking
                // We assume this endpoint exists as per the original HTML code.
                const res = await api.get(`/funds/${id}/tracking`);
                setTrackingData(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load tracking data');
                setLoading(false);
            }
        };

        if (id) fetchTracking();
    }, [id]);

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
            <div className="min-vh-100 bg-premium">
                <div className="container mt-5">
                    <div className="alert alert-danger">{error}</div>
                    <Link to="/admin/funds" className="btn btn-secondary">Back to Funds</Link>
                </div>
            </div>
        );
    }

    // Prepare headers (months) from the first user's data if available
    const monthHeaders = trackingData?.tracking?.[0]?.months?.map(m => m.month) || [];

    return (
        <div className="pb-5">
            <div className="mt-2 text-center pt-4">
                <div className="d-flex justify-content-between align-items-end mb-5 animate-fade-in">
                    <div>
                        <h1 className="fw-bold mb-1 text-white display-5">Asset Allocation Grid</h1>
                        <p className="text-white-50 fs-5 mb-0">
                            Month-wise Tracking: <span className="fw-bold" style={{ color: '#00E5FF' }}>{trackingData?.fundName}</span> |
                            Duration: {trackingData?.duration} Months |
                            Target: ₹{trackingData?.monthlyTarget?.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="card glass-card border-0 p-4 shadow-2xl animate-fade-in overflow-hidden">
                    <div className="card-body p-0">
                        <div className="table-responsive" style={{ maxHeight: '70vh' }}>
                            <table className="table table-hover align-middle mb-0" style={{ color: 'white' }}>
                                <thead>
                                    <tr>
                                        <th className="sticky-col py-4 border-end border-white border-opacity-10"
                                            style={{ position: 'sticky', left: 0, zIndex: 10, minWidth: '220px', background: 'rgba(26, 29, 33, 0.95)', backdropFilter: 'blur(10px)' }}>
                                            <span className="text-white-50 small text-uppercase fw-bold">Member Matrix</span>
                                        </th>
                                        {monthHeaders.map((header, idx) => (
                                            <th key={idx} className="text-center small text-white-50 text-uppercase fw-bold py-4 border-bottom border-white border-opacity-10" style={{ minWidth: '140px' }}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {trackingData?.tracking?.length === 0 ? (
                                        <tr><td colSpan={monthHeaders.length + 1} className="text-center py-5 text-white-50">No tracking data available for this fund.</td></tr>
                                    ) : (
                                        trackingData?.tracking?.map((user) => (
                                            <tr key={user.userId} className="border-bottom border-white border-opacity-5">
                                                <td className="sticky-col border-end border-white border-opacity-10 py-3"
                                                    style={{ position: 'sticky', left: 0, zIndex: 10, background: 'rgba(26, 29, 33, 0.95)', backdropFilter: 'blur(10px)' }}>
                                                    <div className="d-flex justify-content-between align-items-center px-2">
                                                        <div className="fw-bold text-white text-truncate" style={{ maxWidth: '140px' }} title={user.userName}>{user.userName}</div>
                                                        <button className="btn btn-dark btn-sm rounded-3 glass-bg-medium border-0" title="View Member Report" onClick={() => window.open(`/admin/user-report?user_id=${user.userId}&fund_id=${id}`, '_blank')}>
                                                            <i className="bi bi-file-earmark-bar-graph" style={{ color: '#00E5FF' }}></i>
                                                        </button>
                                                    </div>
                                                </td>
                                                {user.months.map((m, idx) => (
                                                    <td key={idx} className="text-center p-3">
                                                        <div className={`p-2 rounded-4 mb-1 transition-all shadow-lg ${m.status === 'Completed' ? 'bg-success bg-opacity-20 border border-success border-opacity-30' :
                                                            m.status === 'Partial' ? 'bg-warning bg-opacity-20 border border-warning border-opacity-30' :
                                                                'bg-danger bg-opacity-20 border border-danger border-opacity-30'
                                                            }`}>
                                                            <div className="fw-bold text-white" style={{ fontSize: '1.1rem' }}>₹{m.paid.toLocaleString()}</div>
                                                            {m.carryIn > 0 && (
                                                                <div className="text-success small fw-bold" style={{ fontSize: '0.65rem' }}>
                                                                    +₹{m.carryIn.toFixed(0)} Carry
                                                                </div>
                                                            )}
                                                            <div className="text-uppercase small fw-extrabold mt-1" style={{ fontSize: '0.55rem', letterSpacing: '1px', color: m.status === 'Completed' ? '#00FFAD' : m.status === 'Partial' ? '#FFC107' : '#FF5252' }}>
                                                                {m.status}
                                                            </div>
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="mt-5 d-flex gap-5 animate-fade-in glass-bg-low p-4 rounded-5 border border-white border-opacity-10 d-inline-flex shadow-xl">
                    <div className="d-flex align-items-center text-white">
                        <span className="badge rounded-circle p-2 bg-success bg-opacity-20 text-success me-3 border border-success border-opacity-30 shadow-glow-success"><i className="bi bi-check-lg"></i></span>
                        <div>
                            <div className="small fw-bold">SETTLED</div>
                            <div className="text-white-50" style={{ fontSize: '0.6rem' }}>Target Achieved</div>
                        </div>
                    </div>
                    <div className="d-flex align-items-center text-white">
                        <span className="badge rounded-circle p-2 bg-warning bg-opacity-20 text-warning me-3 border border-warning border-opacity-30 shadow-glow-warning"><i className="bi bi-clock-history"></i></span>
                        <div>
                            <div className="small fw-bold">PARTIAL</div>
                            <div className="text-white-50" style={{ fontSize: '0.6rem' }}>Pending Balance</div>
                        </div>
                    </div>
                    <div className="d-flex align-items-center text-white">
                        <span className="badge rounded-circle p-2 bg-danger bg-opacity-20 text-danger me-3 border border-danger border-opacity-30 shadow-glow-danger"><i className="bi bi-exclamation-triangle"></i></span>
                        <div>
                            <div className="small fw-bold">OVERDUE</div>
                            <div className="text-white-50" style={{ fontSize: '0.6rem' }}>No Payment</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTracking;
