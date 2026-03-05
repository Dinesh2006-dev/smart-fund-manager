import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminUserModal from '../components/AdminUserModal';
import AdminEnrollModal from '../components/AdminEnrollModal';
import ConfirmModal from '../components/ConfirmModal';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal State
    const [showUserModal, setShowUserModal] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);

    // Confirmation State
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, name: '' });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load users.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteClick = (id, name) => {
        setConfirmDelete({ show: true, id, name });
    };

    const executeDelete = async () => {
        const { id } = confirmDelete;
        try {
            await api.delete(`/users/${id}`);
            setConfirmDelete({ show: false, id: null, name: '' });
            fetchUsers(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user');
            setConfirmDelete({ show: false, id: null, name: '' });
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
            <div className="mt-2 text-center">
                <div className="d-flex justify-content-between align-items-end mb-5 animate-fade-in">
                    <div>
                        <h1 className="fw-bold mb-1 text-white display-5">Investors & Members</h1>
                        <p className="text-white-50 fs-5 mb-0">Onboard and manage platform stakeholders with ease</p>
                    </div>
                    <div className="d-flex gap-3">
                        <button className="btn btn-outline-light rounded-pill px-4 py-2 shadow-lg fw-bold" onClick={() => setShowEnrollModal(true)} style={{ borderWidth: '2px' }}>
                            <i className="bi bi-link-45deg me-1"></i>Enroll Member
                        </button>
                        <button className="btn btn-primary rounded-pill px-4 py-2 shadow-lg border-0 fw-bold" onClick={() => setShowUserModal(true)} style={{ background: 'var(--grad-blue-vibrant)' }}>
                            <i className="bi bi-person-plus me-1"></i>Add Stakeholder
                        </button>
                    </div>
                </div>

                {error && <div className="alert alert-danger bg-danger bg-opacity-10 text-danger border-0 rounded-4 mb-4">{error}</div>}

                <div className="card glass-card border-0 p-4 shadow-2xl animate-fade-in">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle" style={{ color: 'white' }}>
                                <thead>
                                    <tr>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Stakeholder</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Contact Channel</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3">Mobile Reference</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3 text-center">Authorization</th>
                                        <th className="border-bottom border-white border-opacity-10 text-white-50 small text-uppercase py-3 text-end">Control</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.filter(u => u.role === 'user').map(u => (
                                        <tr key={u.id} className="border-bottom border-white border-opacity-5">
                                            <td>
                                                <div className="fw-bold text-white">{u.name}</div>
                                                <div className="small text-white-50">ID: #USR-{u.id}</div>
                                            </td>
                                            <td>
                                                <div className="small fw-semibold text-white">{u.email}</div>
                                            </td>
                                            <td>
                                                <div className="small text-white-50">{u.phone || 'NOT LINKED'}</div>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge ${u.role === 'admin' ? 'bg-danger bg-opacity-20 text-danger' : 'bg-info bg-opacity-20 text-info'} rounded-pill px-3 py-2 text-uppercase`} style={{ fontSize: '0.7rem' }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button className="btn btn-dark btn-sm rounded-3 glass-bg-medium border-0" title="Modify" onClick={() => alert('Edit feature not implemented yet')}>
                                                        <i className="bi bi-pencil-square text-white"></i>
                                                    </button>
                                                    <button className="btn btn-dark btn-sm rounded-3 glass-bg-medium border-0" title="Terminate" onClick={() => handleDeleteClick(u.id, u.name)}>
                                                        <i className="bi bi-trash text-danger"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.filter(u => u.role === 'user').length === 0 && (
                                        <tr><td colSpan="5" className="text-center py-5 text-white-50">No users found in system. Create your first!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {showUserModal && (
                    <AdminUserModal
                        onClose={() => setShowUserModal(false)}
                        onSuccess={fetchUsers}
                    />
                )}

                {showEnrollModal && (
                    <AdminEnrollModal
                        onClose={() => setShowEnrollModal(false)}
                        onSuccess={() => { /* Maybe refresh something? Enroll just links. */ }}
                    />
                )}

                <ConfirmModal
                    show={confirmDelete.show}
                    title="Terminate Stakeholder"
                    message={`Are you sure you want to delete "${confirmDelete.name}"? This will remove all their payment records and fund enrollments permanently!`}
                    onConfirm={executeDelete}
                    onCancel={() => setConfirmDelete({ show: false, id: null, name: '' })}
                />

            </div>
        </div>
    );
};

export default AdminUsers;
