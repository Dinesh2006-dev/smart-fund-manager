import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminEnrollModal = ({ onClose, onSuccess }) => {
    const [users, setUsers] = useState([]);
    const [funds, setFunds] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedFund, setSelectedFund] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, fundsRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/funds')
                ]);
                setUsers(usersRes.data);
                setFunds(fundsRes.data);
                if (usersRes.data.length > 0) setSelectedUser(usersRes.data[0].id);
                if (fundsRes.data.length > 0) setSelectedFund(fundsRes.data[0].id);
            } catch (error) {
                console.error(error);
                alert('Failed to load data for enrollment');
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/users/assign-fund', {
                user_id: selectedUser,
                fund_id: selectedFund
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to enroll user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal show d-block animate-fade-in" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content glass-card border-0 shadow-2xl text-white">
                    <div className="modal-header border-bottom border-white border-opacity-10 py-4">
                        <div className="d-flex align-items-center">
                            <div className="p-2 rounded-3 bg-white bg-opacity-10 me-3" style={{ color: '#00FFAD' }}>
                                <i className="bi bi-link-45deg fs-4"></i>
                            </div>
                            <h4 className="modal-title fw-bold mb-0">System Enrollment</h4>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        {initialLoading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary border-4" style={{ width: '3rem', height: '3rem' }}></div>
                                <div className="mt-3 text-white-50 fw-bold">Synchronizing Nodes...</div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label text-white-50 small fw-extrabold tracking-wider">SELECT STAKEHOLDER</label>
                                    <select className="form-select bg-white bg-opacity-5 text-white border-white border-opacity-10 py-2 rounded-3 cursor-pointer"
                                        value={selectedUser} onChange={e => setSelectedUser(e.target.value)} required
                                        style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3e%3cpath fill=%27none%27 stroke=%27%23ffffff80%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m2 5 6 6 6-6%27/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '16px 12px' }}>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id} style={{ background: '#1A1D21' }}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-5">
                                    <label className="form-label text-white-50 small fw-extrabold tracking-wider">SELECT TARGET ASSET</label>
                                    <select className="form-select bg-white bg-opacity-5 text-white border-white border-opacity-10 py-2 rounded-3 cursor-pointer"
                                        value={selectedFund} onChange={e => setSelectedFund(e.target.value)} required
                                        style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3e%3cpath fill=%27none%27 stroke=%27%23ffffff80%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m2 5 6 6 6-6%27/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '16px 12px' }}>
                                        {funds.map(f => (
                                            <option key={f.id} value={f.id} style={{ background: '#1A1D21' }}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-4 shadow-lg border-0 mb-2"
                                    style={{ background: 'linear-gradient(135deg, #00BFA5 0%, #00FFAD 100%)' }}
                                    disabled={loading}>
                                    {loading ? (
                                        <span><span className="spinner-border spinner-border-sm me-2" role="status"></span>Finalizing Logic...</span>
                                    ) : 'Complete Enrollment Protocol'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEnrollModal;
