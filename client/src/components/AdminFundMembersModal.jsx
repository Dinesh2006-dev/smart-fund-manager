import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminFundMembersModal = ({ fund, onClose }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get(`/funds/${fund.id}/members`);
                setMembers(res.data);
            } catch (error) {
                console.error(error);
                alert('Failed to load members');
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, [fund]);

    return (
        <div className="modal show d-block animate-fade-in" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content glass-card border-0 shadow-2xl text-white">
                    <div className="modal-header border-bottom border-white border-opacity-10 py-4">
                        <div className="d-flex align-items-center">
                            <div className="p-2 rounded-3 bg-white bg-opacity-10 me-3" style={{ color: '#00E5FF' }}>
                                <i className="bi bi-people-fill fs-4"></i>
                            </div>
                            <h4 className="modal-title fw-bold mb-0">Stakeholders: {fund.name}</h4>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-info border-4" style={{ width: '3rem', height: '3rem' }}></div>
                                <div className="mt-3 text-white-50 fw-bold">Querying Member Registry...</div>
                            </div>
                        ) : (
                            <div className="table-responsive rounded-4 border border-white border-opacity-10">
                                <table className="table table-hover align-middle mb-0" style={{ color: 'white' }}>
                                    <thead className="bg-white bg-opacity-5">
                                        <tr>
                                            <th className="py-3 border-0 text-white-50 small text-uppercase ps-4">Stakeholder</th>
                                            <th className="py-3 border-0 text-white-50 small text-uppercase">Contact Alias</th>
                                            <th className="py-3 border-0 text-white-50 small text-uppercase">Entry Date</th>
                                            <th className="py-3 border-0 text-white-50 small text-uppercase text-end">Capitalized</th>
                                            <th className="py-3 border-0 text-white-50 small text-uppercase text-end pe-4">Obligation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.length === 0 ? (
                                            <tr><td colSpan="5" className="text-center py-5 text-white-50">No stakeholders currently associated with this asset class.</td></tr>
                                        ) : (
                                            members.map(m => (
                                                <tr key={m.id} className="border-bottom border-white border-opacity-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                                    <td className="ps-4 fw-bold">{m.name}</td>
                                                    <td className="text-white-50 small">{m.email}</td>
                                                    <td className="text-white-50 small">{new Date(m.joined_at).toLocaleDateString()}</td>
                                                    <td className="text-end fw-bold" style={{ color: '#00FFAD' }}>₹{Number(m.total_paid).toLocaleString()}</td>
                                                    <td className="text-end fw-bold pe-4" style={{ color: '#FF5252' }}>₹{Number(m.pending_balance).toLocaleString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer border-top border-white border-opacity-10 py-3">
                        <button type="button" className="btn btn-outline-light rounded-pill px-4 btn-sm" onClick={onClose}>Close Registry</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFundMembersModal;
