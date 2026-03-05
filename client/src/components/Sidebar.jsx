import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const navItems = user.role === 'admin' ? [
        { path: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
        { path: '/admin/funds', icon: 'bi-bank', label: 'Manage Funds' },
        { path: '/admin/users', icon: 'bi-people', label: 'Manage Users' },
        { path: '/admin/payments', icon: 'bi-currency-exchange', label: 'Payments' },
        { path: '/admin/user-report', icon: 'bi-file-earmark-bar-graph', label: 'Reports' },
        { path: '/admin/profile', icon: 'bi-person', label: 'Profile' },
    ] : [
        { path: '/user/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
        { path: '/user/passbook', icon: 'bi-receipt', label: 'Expenses' },
        { path: '/user/wallet', icon: 'bi-wallet2', label: 'My Wallet' },
        { path: '/user/profile', icon: 'bi-person', label: 'Profile' },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <i className="bi bi-wallet2 me-3 fs-3"></i>
                <span>Smart Fund</span>
            </div>

            <div className="sidebar-content">
                {navItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                    >
                        <i className={`bi ${item.icon}`}></i>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>

            <div className="sidebar-footer">
                <div className="d-flex align-items-center p-2 mb-2">
                    <div
                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold me-3"
                        style={{ width: '40px', height: '40px' }}
                    >
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-white small fw-bold text-truncate">{user.name}</div>
                        <div className="text-muted x-small text-truncate">{user.email}</div>
                    </div>
                </div>
                <button
                    className="btn btn-link sidebar-item w-100 text-start border-0 text-danger"
                    onClick={logout}
                    style={{ background: 'transparent' }}
                >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
