import React, { useState } from 'react';
import api from '../api/axios';

const AdminUserModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '123456', // Default password as per original html
        phone: '',
        role: 'user'
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            onSuccess();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create user');
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
                            <div className="p-2 rounded-3 bg-white bg-opacity-10 me-3" style={{ color: '#9C27B0' }}>
                                <i className="bi bi-person-plus-fill fs-4"></i>
                            </div>
                            <h4 className="modal-title fw-bold mb-0">Onboard Stakeholder</h4>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label text-white-50 small fw-extrabold tracking-wider">FULL NAME</label>
                                <input type="text" id="name" className="form-control bg-white bg-opacity-5 text-white border-white border-opacity-10 py-2 rounded-3"
                                    required placeholder="Legal name of entity" value={formData.name} onChange={handleChange} />
                            </div>
                            <div className="mb-4">
                                <label className="form-label text-white-50 small fw-extrabold tracking-wider">EMAIL ADDRESS</label>
                                <input type="email" id="email" className="form-control bg-white bg-opacity-5 text-white border-white border-opacity-10 py-2 rounded-3"
                                    required placeholder="active@example.com" value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="mb-4">
                                <label className="form-label text-white-50 small fw-extrabold tracking-wider">SECURE PASSWORD</label>
                                <input type="text" id="password" className="form-control bg-white bg-opacity-5 text-white border-white border-opacity-10 py-2 rounded-3 font-monospace"
                                    required value={formData.password} onChange={handleChange} />
                                <div className="form-text text-white-50 small mt-2">Temporary access token for first-time authentication.</div>
                            </div>
                            <div className="mb-5">
                                <label className="form-label text-white-50 small fw-extrabold tracking-wider">PHONE DIGITS</label>
                                <input type="text" id="phone" className="form-control bg-white bg-opacity-5 text-white border-white border-opacity-10 py-2 rounded-3"
                                    placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} />
                            </div>
                            <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-4 shadow-lg border-0"
                                style={{ background: 'var(--grad-purple-vibrant)' }}
                                disabled={loading}>
                                {loading ? (
                                    <span><span className="spinner-border spinner-border-sm me-2" role="status"></span>Syncing Profile...</span>
                                ) : 'Initialize Stakeholder Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserModal;
