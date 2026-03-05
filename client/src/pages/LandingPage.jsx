import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

import ForgotPasswordModal from '../components/ForgotPasswordModal';

const LandingPage = () => {
    const [view, setView] = useState('roleSelection'); // 'roleSelection', 'login'
    const [role, setRole] = useState(null); // 'user' or 'admin'
    const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'danger'
    const [showForgotModal, setShowForgotModal] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    // Show login view for specific role
    const showLogin = (selectedRole) => {
        setRole(selectedRole);
        setView('login');
        setActiveTab('login');
        setMessage('');
    };

    // Go back to role selection
    const goBack = () => {
        setView('roleSelection');
        setRole(null);
        setMessage('');
    };

    // Handle Login Submission
    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            // Use the existing backend API
            const response = await api.post('/auth/login', { email, password });
            const data = response.data;

            // Role Verification
            if (role === 'admin' && data.user.role !== 'admin') {
                throw new Error('Access denied. This portal is for Admins only.');
            }

            // Use Auth Context to Login (Updates state + localStorage)
            login(data.user, data.token);

            // Redirect
            if (data.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/user/dashboard');
            }

        } catch (error) {
            setMessageType('danger');
            setMessage(error.response?.data?.message || error.message);
        }
    };

    // Handle Registration Submission
    const handleRegister = async (e) => {
        e.preventDefault();
        const userData = {
            name: e.target.regName.value,
            email: e.target.regEmail.value,
            phone: e.target.regPhone.value,
            password: e.target.regPassword.value,
            role: 'user' // Force user role
        };

        try {
            await api.post('/auth/register', userData);
            setMessageType('success');
            setMessage('Account created! Please log in.');
            setTimeout(() => setActiveTab('login'), 1500);
        } catch (error) {
            setMessageType('danger');
            setMessage(error.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div className="bg-premium d-flex align-items-center min-vh-100 py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-10 col-lg-8">

                        {/* Role Selection View with Marketing */}
                        {view === 'roleSelection' && (
                            <div className="text-center animate-fade-in">
                                <div className="mb-5">
                                    <div className="d-inline-block p-4 rounded-circle mb-4 position-relative">
                                        {/* Logo Glow */}
                                        <div className="position-absolute top-50 start-50 translate-middle w-100 h-100 rounded-circle opacity-25" style={{ background: 'var(--grad-blue-vibrant)', filter: 'blur(30px)', zIndex: -1 }}></div>
                                        <img src="https://img.icons8.com/isometric/100/coins.png" alt="Smart Fund Logo" width="100" className="position-relative" />
                                    </div>
                                    <h1 className="display-3 fw-bold mb-2 tracking-tight text-white mb-3" style={{ letterSpacing: '-2px' }}>Smart Fund Manager</h1>
                                    <p className="text-white-50 fs-4 mb-4 mx-auto" style={{ maxWidth: '600px' }}>Invest, Track, and Grow. The future of community finance is here.</p>
                                </div>

                                <div className="row g-4 justify-content-center mb-5 pb-5">
                                    <div className="col-md-6">
                                        <div className="card glass-card portal-card cursor-pointer border-0" onClick={() => showLogin('user')} role="button">
                                            <div className="card-body p-4">
                                                <div className="portal-icon mx-auto mb-4 text-white" style={{ background: 'var(--grad-purple-blue)' }}>
                                                    <i className="bi bi-person-fill"></i>
                                                </div>
                                                <h3 className="fw-bold mb-3 text-white">Member Portal</h3>
                                                <p className="text-white-50 mb-4 px-3">Join funds, automate your savings, and track your growth in real-time.</p>
                                                <button className="btn btn-primary w-100 rounded-pill py-3 fw-bold">Login to Invest</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card glass-card portal-card cursor-pointer border-0" onClick={() => showLogin('admin')} role="button">
                                            <div className="card-body p-4">
                                                <div className="portal-icon mx-auto mb-4 rounded-4" style={{ background: 'var(--grad-cyan-pink)' }}>
                                                    <i className="bi bi-shield-lock-fill text-white"></i>
                                                </div>
                                                <h3 className="fw-bold mb-3 text-white">Admin Portal</h3>
                                                <p className="text-white-50 mb-4 px-3">Create funds, manage members, and oversee community wealth.</p>
                                                <button className="btn btn-outline-light w-100 rounded-pill py-3 fw-bold" style={{ borderWidth: '2px' }}>Admin Dashboard</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Marketing / Features Section */}
                                <div className="row g-4 text-start pt-5 border-top border-white border-opacity-10">
                                    <div className="col-md-4">
                                        <div className="d-flex align-items-center">
                                            <div className="me-3 p-3 rounded-4" style={{ background: 'var(--grad-green-blue)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="bi bi-lightning-fill fs-4 text-white"></i>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-1 text-white">Fast Transfers</h6>
                                                <p className="small text-white-50 mb-0">Instant wallet loads and withdrawals via UPI.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="d-flex align-items-center">
                                            <div className="me-3 p-3 rounded-4" style={{ background: 'var(--grad-yellow-pink)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="bi bi-graph-up-arrow fs-4 text-white"></i>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-1 text-white">P&L Analytics</h6>
                                                <p className="small text-white-50 mb-0">Deep insights into your portfolio performance.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="d-flex align-items-center">
                                            <div className="me-3 p-3 rounded-4" style={{ background: 'var(--grad-purple-blue)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="bi bi-shield-check fs-4 text-white"></i>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-1 text-white">Bank-Grade</h6>
                                                <p className="small text-white-50 mb-0">End-to-end encryption for your peace of mind.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* Login/Register View */}
                        {view === 'login' && (
                            <div className="card glass-card border-0 animate-fade-in shadow-2xl">
                                <div className="card-body p-4 p-md-5">
                                    <div className="d-flex align-items-center mb-5">
                                        <button className="btn btn-link p-0 text-white text-decoration-none me-3" onClick={goBack}>
                                            <i className="bi bi-chevron-left fs-4"></i>
                                        </button>
                                        <h2 className="mb-0 fw-bold text-white">{role === 'admin' ? 'Admin Access' : 'Create Account / Sign In'}</h2>
                                    </div>

                                    <ul className="nav nav-pills nav-justified mb-4 bg-white bg-opacity-10 p-1 rounded-4">
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link rounded-4 py-2 ${activeTab === 'login' ? 'active bg-primary' : 'text-white'}`}
                                                onClick={() => setActiveTab('login')}
                                            >
                                                Log In
                                            </button>
                                        </li>
                                        {role !== 'admin' && (
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link rounded-4 py-2 ${activeTab === 'register' ? 'active bg-primary' : 'text-white'}`}
                                                    onClick={() => setActiveTab('register')}
                                                >
                                                    Sign Up
                                                </button>
                                            </li>
                                        )}
                                    </ul>

                                    <div className="tab-content pt-3">
                                        {/* Login Form */}
                                        {activeTab === 'login' && (
                                            <form onSubmit={handleLogin}>
                                                <div className="mb-4">
                                                    <label className="form-label text-white-50 small fw-bold">EMAIL ADDRESS</label>
                                                    <input type="email" name="email" className="form-control bg-dark bg-opacity-25 border-white border-opacity-10 text-white py-3" required placeholder={role === 'admin' ? 'admin@example.com' : 'name@example.com'} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label text-white-50 small fw-bold">PASSWORD</label>
                                                    <input type="password" name="password" className="form-control bg-dark bg-opacity-25 border-white border-opacity-10 text-white py-3" required placeholder="********" />
                                                </div>
                                                <div className="mb-4 text-end">
                                                    <button type="button" className="btn btn-link small text-white-50 text-decoration-none p-0" onClick={() => setShowForgotModal(true)}>Forgot Password?</button>
                                                </div>
                                                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-4 shadow-lg">Sign In to Dashboard</button>
                                            </form>
                                        )}

                                        {/* Register Form */}
                                        {activeTab === 'register' && (
                                            <form onSubmit={handleRegister}>
                                                <div className="mb-4">
                                                    <label className="form-label text-white-50 small fw-bold">FULL NAME</label>
                                                    <input type="text" name="regName" className="form-control bg-dark bg-opacity-25 border-white border-opacity-10 text-white py-3" required />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="form-label text-white-50 small fw-bold">EMAIL ADDRESS</label>
                                                    <input type="email" name="regEmail" className="form-control bg-dark bg-opacity-25 border-white border-opacity-10 text-white py-3" required placeholder="name@example.com" />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="form-label text-white-50 small fw-bold">PHONE NUMBER</label>
                                                    <input type="text" name="regPhone" className="form-control bg-dark bg-opacity-25 border-white border-opacity-10 text-white py-3" placeholder="91XXXXXXXXXX" />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="form-label text-white-50 small fw-bold">PASSWORD</label>
                                                    <input type="password" name="regPassword" className="form-control bg-dark bg-opacity-25 border-white border-opacity-10 text-white py-3" required placeholder="********" />
                                                </div>
                                                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-4 shadow-lg" style={{ background: 'var(--grad-purple-blue)' }}>Create Account</button>
                                            </form>
                                        )}
                                    </div>

                                    {message && (
                                        <div className={`mt-4 text-center small p-3 rounded-4 ${messageType === 'danger' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'}`}>
                                            {message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}

        </div>
    );
};

export default LandingPage;
