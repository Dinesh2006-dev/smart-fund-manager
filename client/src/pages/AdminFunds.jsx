import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminFundModal from '../components/AdminFundModal';
import AdminFundMembersModal from '../components/AdminFundMembersModal';
import ConfirmModal from '../components/ConfirmModal';

const AdminFunds = () => {
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal Interaction State
    const [showFundModal, setShowFundModal] = useState(false);
    const [editingFund, setEditingFund] = useState(null);

    const [showMembersModal, setShowMembersModal] = useState(false);
    const [selectedFundForMembers, setSelectedFundForMembers] = useState(null);

    // Confirmation State
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, name: '' });

    const fetchFunds = async () => {
        try {
            setLoading(true);
            const res = await api.get('/funds');
            setFunds(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load funds.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFunds();
    }, []);

    const handleDeleteClick = (id, name) => {
        setConfirmDelete({ show: true, id, name });
    };

    const executeDelete = async () => {
        const { id } = confirmDelete;
        try {
            await api.delete(`/funds/${id}`);
            setConfirmDelete({ show: false, id: null, name: '' });
            fetchFunds(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete fund');
            setConfirmDelete({ show: false, id: null, name: '' });
        }
    };

    const openEditModal = (fund) => {
        setEditingFund(fund);
        setShowFundModal(true);
    };

    const openCreateModal = () => {
        setEditingFund(null);
        setShowFundModal(true);
    };

    const openMembersModal = (fund) => {
        setSelectedFundForMembers(fund);
        setShowMembersModal(true);
    };

    if (loading) {
        return (
            <div className="min-vh-100">
                <div className="container mt-5 text-center">
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
                        <h1 className="fw-bold mb-1 text-white display-5">Fund Repository</h1>
                        <p className="text-white-50 fs-5 mb-0">Configure and monitor your premium financial products</p>
                    </div>
                    <button className="btn btn-primary rounded-pill px-4 py-2 shadow-lg border-0 fw-bold" onClick={openCreateModal} style={{ background: 'var(--grad-blue-vibrant)' }}>
                        <i className="bi bi-plus-lg me-2"></i>Create New Fund
                    </button>
                </div>

                {error && <div className="alert alert-danger bg-danger bg-opacity-10 text-danger border-0 rounded-4 mb-4">{error}</div>}

                <div className="card glass-card border-0 p-4 shadow-2xl animate-fade-in">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle" style={{ color: 'white' }}>
                                <thead>
                                    <tr>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Fund Identity</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Goal Target</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Tenure</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Enrollment</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Frequency</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3 text-center">Lifecycle</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3 text-end">Control</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {funds.map(f => (
                                        <tr key={f.id} className="border-bottom border-white border-opacity-5">
                                            <td>
                                                <div className="fw-bold text-white">
                                                    {f.name}
                                                    {f.terms && <i className="bi bi-file-earmark-text-fill ms-2" title="Terms & Conditions Applied" style={{ color: '#00E5FF' }}></i>}
                                                </div>
                                                <div className="small text-white-50">Ref: #{f.id}</div>
                                            </td>
                                            <td className="fw-bold" style={{ color: '#00FFAD' }}>₹{f.total_amount.toLocaleString()}</td>
                                            <td>
                                                <div className="small fw-semibold text-white">{f.duration} Units</div>
                                                <div className="text-white-50" style={{ fontSize: '0.7rem' }}>
                                                    {f.type === 'daily' ? 'DAILY CYCLE' : f.type === 'weekly' ? 'WEEKLY CYCLE' : 'MONTHLY CYCLE'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge glass-bg-medium text-white rounded-pill px-3 py-2">{f.member_count} Members</span>
                                            </td>
                                            <td>
                                                <span className="text-uppercase small fw-bold text-white-50">{f.type}</span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge ${f.status === 'active' ? 'bg-success bg-opacity-20 text-success' : 'glass-bg-medium text-white-50'} rounded-pill px-3 py-2`}>
                                                    {f.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button className="btn btn-dark btn-sm rounded-3 glass-bg-medium border-0" title="View Members" onClick={() => openMembersModal(f)}>
                                                        <i className="bi bi-people" style={{ color: '#00E5FF' }}></i>
                                                    </button>
                                                    <button className="btn btn-dark btn-sm rounded-3 glass-bg-medium border-0" title="Track Progress" onClick={() => window.location.href = `/admin/tracking/${f.id}`}>
                                                        <i className="bi bi-graph-up text-success"></i>
                                                    </button>
                                                    <button className="btn btn-dark btn-sm rounded-3 glass-bg-medium border-0" title="Edit" onClick={() => openEditModal(f)}>
                                                        <i className="bi bi-pencil-square text-white"></i>
                                                    </button>
                                                    <button className="btn btn-dark btn-sm rounded-3 glass-bg-medium border-0" title="Delete" onClick={() => handleDeleteClick(f.id, f.name)}>
                                                        <i className="bi bi-trash text-danger"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {funds.length === 0 && (
                                        <tr><td colSpan="7" className="text-center text-white-50 py-5">No funds found in repository. Create your first!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {showFundModal && (
                    <AdminFundModal
                        fund={editingFund}
                        onClose={() => setShowFundModal(false)}
                        onSuccess={fetchFunds}
                    />
                )}

                {showMembersModal && selectedFundForMembers && (
                    <AdminFundMembersModal
                        fund={selectedFundForMembers}
                        onClose={() => setShowMembersModal(false)}
                    />
                )}

                <ConfirmModal
                    show={confirmDelete.show}
                    title="Delete Fund"
                    message={`Are you sure you want to delete "${confirmDelete.name}"? This cannot be undone.`}
                    onConfirm={executeDelete}
                    onCancel={() => setConfirmDelete({ show: false, id: null, name: '' })}
                />

            </div>
        </div>
    );
};

export default AdminFunds;
