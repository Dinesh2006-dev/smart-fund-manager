import React, { useState } from 'react';
import api from '../api/axios';

const ForgotPasswordModal = ({ onClose }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & Reset
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setMessage('Sending OTP...');
        try {
            const response = await api.post('/auth/forgot-password', { email });
            setMessage(response.data.message || 'OTP sent successfully!');
            setMessageType('success');
            setStep(2);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error sending OTP');
            setMessageType('danger');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/reset-password', { email, otp, newPassword });
            setMessage(response.data.message || 'Password reset successful!');
            setMessageType('success');
            setTimeout(() => {
                onClose(); // Close modal
            }, 2000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error resetting password');
            setMessageType('danger');
        }
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Reset Password</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {step === 1 ? (
                            <form onSubmit={handleSendOTP}>
                                <div className="mb-3">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your-email@example.com"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">Send OTP</button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <p className="small text-muted mb-3">OTP sent to <strong>{email}</strong></p>
                                <div className="mb-3">
                                    <label className="form-label">Verification Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        required
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-success w-100">Reset Password</button>
                                <button type="button" className="btn btn-link w-100 mt-2" onClick={() => setStep(1)}>Resend OTP</button>
                            </form>
                        )}
                        {message && <div className={`mt-3 text-center text-${messageType} small`}>{message}</div>}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ForgotPasswordModal;
