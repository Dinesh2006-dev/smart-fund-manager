import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminFundModal = ({ fund, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        total_amount: '',
        duration: '',
        type: 'monthly',
        start_date: '',
        end_date: '',
        terms: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (fund) {
            setFormData({
                name: fund.name,
                total_amount: fund.total_amount,
                duration: fund.duration,
                type: fund.type,
                start_date: fund.start_date ? fund.start_date.split('T')[0] : '',
                end_date: fund.end_date ? fund.end_date.split('T')[0] : '',
                terms: fund.terms || ''
            });
        }
    }, [fund]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (fund) {
                await api.put(`/funds/${fund.id}`, formData);
            } else {
                await api.post('/funds', formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save fund');
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
                            <div className="p-2 rounded-3 bg-white bg-opacity-10 me-3" style={{ color: '#00E5FF' }}>
                                <i className="bi bi-gear-fill fs-4"></i>
                            </div>
                            <h4 className="modal-title fw-bold mb-0">{fund ? 'Configure Fund' : 'Design New Fund'}</h4>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label text-white-50 small fw-extrabold tracking-wider">FUND IDENTITY</label>
                                <input type="text" id="name" className="form-control bg-white bg-opacity-5 text-white border-white border-opacity-10 py-2 rounded-3"
                                    required placeholder="e.g., Premium Growth Savings 2024" value={formData.name} onChange={handleChange} />
                            </div>
                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label text-white-50 small fw-extrabold tracking-wider">GOAL TARGET (₹)</label>
                                    <input type="number" id="total_amount" className="form-control bg-white bg-opacity-5 text-white border-white border-opacity-10 py-2 rounded-3"
                                        required value={formData.total_amount} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-white-50 small fw-extrabold tracking-wider">TENURE (UNITS)</label>
                                    <input type="number" id="duration" className="form-control bg-white bg-opacity-5 text-white border-white border-opacity-10 py-2 rounded-3"
                                        required placeholder="Quantity of terms" value={formData.duration} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="form-label text-white-50 small fw-extrabold tracking-wider">COLLECTION CYCLE</label>
                                <select id="type" className="form-select bg-white bg-opacity-5 text-white border-white border-opacity-10 py-2 rounded-3 cursor-pointer"
                                    value={formData.type} onChange={handleChange}
                                    style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3e%3cpath fill=%27none%27 stroke=%27%23ffffff80%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m2 5 6 6 6-6%27/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '16px 12px' }}>
                                    <option value="daily" style={{ background: '#1A1D21' }}>Daily Operations</option>
                                    <option value="weekly" style={{ background: '#1A1D21' }}>Weekly Collection</option>
                                    <option value="monthly" style={{ background: '#1A1D21' }}>Monthly Ledger</option>
                                </select>
                            </div>
                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label text-white-50 small fw-extrabold tracking-wider">START DATE</label>
                                    <input type="date" id="start_date" className="form-control bg-white bg-opacity-5 text-white border-white border-opacity-10 py-2 rounded-3"
                                        value={formData.start_date} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-white-50 small fw-extrabold tracking-wider">END DATE</label>
                                    <input type="date" id="end_date" className="form-control bg-white bg-opacity-5 text-white border-white border-opacity-10 py-2 rounded-3"
                                        value={formData.end_date} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="form-label text-white-50 small fw-extrabold tracking-wider">TERMS & GOVERNANCE</label>
                                <textarea id="terms" className="form-control bg-white bg-opacity-5 text-white border-white border-opacity-10 py-2 rounded-3" rows="3"
                                    placeholder="Outline the rules and protocols for this asset class..." value={formData.terms} onChange={handleChange}></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-4 shadow-lg border-0 mt-2"
                                style={{ background: 'var(--grad-blue-vibrant)' }}
                                disabled={loading}>
                                {loading ? (
                                    <span><span className="spinner-border spinner-border-sm me-2" role="status"></span>Syncing Repository...</span>
                                ) : (fund ? 'Update Specifications' : 'Initialize Asset Class')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFundModal;
