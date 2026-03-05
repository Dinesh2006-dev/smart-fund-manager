import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

const AdminPayments = () => {
    const { token } = useAuth();
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

    useEffect(() => {
        fetchPayments();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredPayments(payments);
        } else {
            const lower = searchTerm.toLowerCase();
            setFilteredPayments(payments.filter(p =>
                p.user_name.toLowerCase().includes(lower) ||
                p.fund_name.toLowerCase().includes(lower)
            ));
        }
    }, [searchTerm, payments]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/payments');
            setPayments(res.data);
            setFilteredPayments(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setConfirmDelete({ show: true, id });
    };

    const executeDelete = async () => {
        const { id } = confirmDelete;
        try {
            await api.delete(`/payments/${id}`);
            setConfirmDelete({ show: false, id: null });
            fetchPayments();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete payment');
            setConfirmDelete({ show: false, id: null });
        }
    };

    const handleExport = async () => {
        // ... existing export code ...
        try {
            const response = await api.get('/payments/export/csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'transactions.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            alert('Export failed');
        }
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

    return (
        <div className="pb-5">
            <div className="mt-2">
                <div className="d-flex justify-content-between align-items-end mb-5 animate-fade-in">
                    <div>
                        <h1 className="fw-bold mb-1 text-white display-5">Financial Ledger</h1>
                        <p className="text-white-50 fs-5 mb-0">Audit and verify all platform transactions in real-time</p>
                    </div>
                    <div className="d-flex gap-3">
                        <div className="input-group overflow-hidden rounded-pill border-0 shadow-lg" style={{ width: '320px' }}>
                            <span className="input-group-text glass-bg-medium border-0 ps-4"><i className="bi bi-search text-white-50"></i></span>
                            <input
                                type="text"
                                className="form-control glass-bg-medium border-0 text-white placeholder-white-50 py-2"
                                placeholder="Search user or fund..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ boxShadow: 'none' }}
                            />
                        </div>
                        <button className="btn btn-outline-light rounded-pill px-4 fw-bold shadow-sm" onClick={handleExport} style={{ borderWidth: '2px' }}>
                            <i className="bi bi-file-earmark-spreadsheet me-2"></i>Export CSV
                        </button>
                    </div>
                </div>

                <div className="card glass-card border-0 p-4 shadow-2xl animate-fade-in">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle" style={{ color: 'white' }}>
                                <thead>
                                    <tr>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Time Reference</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Fiscal Period</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Member Entity</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Asset Class</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3 text-end">Volume</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3 text-center">Protocol</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3 text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map(p => (
                                        <tr key={p.id} className="border-bottom border-white border-opacity-5">
                                            <td className="text-white-50 small">{new Date(p.payment_date).toLocaleDateString()}</td>
                                            <td>
                                                <div className="fw-bold small text-white">{p.payment_month || 'N/A'}</div>
                                                <span className="badge glass-bg-medium text-white-50" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>
                                                    {(p.payment_schedule || 'monthly').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="fw-bold text-white">{p.user_name}</td>
                                            <td className="text-white-50 small">{p.fund_name}</td>
                                            <td className="fw-bold text-end" style={{ color: '#00FFAD' }}>+ ₹{p.amount.toLocaleString()}</td>
                                            <td className="text-center"><span className="badge bg-success bg-opacity-20 text-success rounded-pill px-3 py-2">RECORDED</span></td>
                                            <td className="text-end">
                                                <button className="btn btn-dark btn-sm rounded-3 glass-bg-medium border-0" title="Delete Entry" onClick={() => handleDeleteClick(p.id)}>
                                                    <i className="bi bi-trash text-danger"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredPayments.length === 0 && (
                                        <tr><td colSpan="7" className="text-center py-5 text-white-50">No matching transactions found in ledger.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <ConfirmModal
                    show={confirmDelete.show}
                    title="Confirm Deletion"
                    message="Are you sure? Deleting this payment will automatically recalculate the member's balance. This cannot be undone!"
                    onConfirm={executeDelete}
                    onCancel={() => setConfirmDelete({ show: false, id: null })}
                />
            </div>
        </div>
    );
};

export default AdminPayments;
