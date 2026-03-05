import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { user, login } = useAuth();
    const [profile, setProfile] = useState({
        name: '',
        phone: '',
        email: '',
        wallet_balance: 0
    });
    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/me');
            setProfile(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'danger', text: 'Failed to load profile details.' });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/users/me', {
                name: profile.name,
                phone: profile.phone
            });

            // Update context/localStorage
            const updatedUser = { ...user, name: profile.name };
            login(updatedUser, localStorage.getItem('token'));

            setMessage({ type: 'success', text: 'Profile updated successfully! ✨' });
        } catch (error) {
            setMessage({ type: 'danger', text: error.response?.data?.message || 'Update failed.' });
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setMessage({ type: 'danger', text: 'Passwords do not match.' });
        }

        setUpdating(true);
        try {
            await api.post('/users/me', { password: passwords.newPassword });
            setPasswords({ newPassword: '', confirmPassword: '' });
            setMessage({ type: 'success', text: 'Password changed successfully! 🔐' });
        } catch (error) {
            setMessage({ type: 'danger', text: error.response?.data?.message || 'Failed to change password.' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    return (
        <div className="container py-5 animate-fade-in">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="mb-5">
                        <h1 className="fw-bold text-white mb-2 display-5" style={{ letterSpacing: '-1.5px' }}>
                            Account <span style={{ background: 'var(--grad-blue-vibrant)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Settings</span>
                        </h1>
                        <p className="text-white-50 fs-5">Manage your personal information and security.</p>
                    </div>

                    {message.text && (
                        <div className={`alert alert-${message.type} border-0 rounded-4 shadow-lg mb-4 animate-slide-up`}>
                            {message.text}
                        </div>
                    )}

                    <div className="row g-4">
                        {/* Profile Details */}
                        <div className="col-md-7">
                            <div className="card glass-card border-0 p-4 h-100">
                                <h5 className="text-white fw-bold mb-4 d-flex align-items-center">
                                    <i className="bi bi-person-badge me-2 text-primary"></i> Personal Information
                                </h5>
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="mb-4">
                                        <label className="form-label text-white-50 small fw-bold tracking-wider">FULL NAME</label>
                                        <input
                                            type="text"
                                            className="form-control bg-white bg-opacity-5 text-white border-white border-opacity-10 py-3 rounded-4"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label text-white-50 small fw-bold tracking-wider">EMAIL ADDRESS</label>
                                        <input
                                            type="email"
                                            className="form-control bg-white bg-opacity-5 text-white-50 border-white border-opacity-10 py-3 rounded-4"
                                            value={profile.email}
                                            disabled
                                        />
                                        <div className="form-text text-white-50 small">Email cannot be changed for security.</div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label text-white-50 small fw-bold tracking-wider">PHONE NUMBER</label>
                                        <input
                                            type="text"
                                            className="form-control bg-white bg-opacity-5 text-white border-white border-opacity-10 py-3 rounded-4"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary px-5 py-3 rounded-4 fw-bold border-0 shadow-lg mt-2"
                                        style={{ background: 'var(--grad-blue-vibrant)' }}
                                        disabled={updating}>
                                        {updating ? 'Updating...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Security / Sidebar */}
                        <div className="col-md-5">
                            <div className="d-flex flex-column gap-4">
                                {/* Balance Snapshot */}
                                <div className="card glass-card border-0 p-4 overflow-hidden position-relative" style={{ background: 'var(--grad-blue-vibrant)' }}>
                                    <div className="position-relative z-1 text-white">
                                        <div className="text-white-50 small fw-bold text-uppercase tracking-wider">Wallet Balance</div>
                                        <h2 className="fw-extrabold mb-0 display-6 mt-1">₹{Number(profile.wallet_balance).toLocaleString()}</h2>
                                    </div>
                                    <i className="bi bi-wallet2 position-absolute end-0 bottom-0 m-4 fs-1 opacity-10"></i>
                                </div>

                                {/* Security Form */}
                                <div className="card glass-card border-0 p-4">
                                    <h5 className="text-white fw-bold mb-4 d-flex align-items-center">
                                        <i className="bi bi-shield-lock me-2 text-warning"></i> Security
                                    </h5>
                                    <form onSubmit={handleChangePassword}>
                                        <div className="mb-4">
                                            <label className="form-label text-white-50 small fw-bold tracking-wider">NEW PASSWORD</label>
                                            <input
                                                type="password"
                                                className="form-control bg-white bg-opacity-5 text-white border-white border-opacity-10 py-3 rounded-4"
                                                value={passwords.newPassword}
                                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                                placeholder="Leave blank to keep current"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label text-white-50 small fw-bold tracking-wider">CONFIRM PASSWORD</label>
                                            <input
                                                type="password"
                                                className="form-control bg-white bg-opacity-5 text-white border-white border-opacity-10 py-3 rounded-4"
                                                value={passwords.confirmPassword}
                                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                        <button type="submit" className="btn glass-bg-medium text-white w-100 py-3 rounded-4 fw-bold border-white border-opacity-10"
                                            disabled={updating || !passwords.newPassword}>
                                            Update Password
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
