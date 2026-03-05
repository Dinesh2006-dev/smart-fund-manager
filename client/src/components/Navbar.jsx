import React, { useState, useEffect } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [notifications, setNotifications] = useState([]);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.body.setAttribute('data-theme', newTheme);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (user && user.role === 'user') {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/dashboard/user/summary');
            const funds = res.data.funds || [];

            const newNotifs = [];
            const dayOfMonth = new Date().getDate();

            funds.forEach(f => {
                if (f.currentMonthBalance > 0) {
                    if (dayOfMonth >= 5 && dayOfMonth < 10) {
                        newNotifs.push({
                            message: `📅 Payment due soon for <strong>${f.name}</strong>.`,
                            type: 'warning'
                        });
                    }
                    else if (dayOfMonth >= 10) {
                        newNotifs.push({
                            message: `⚠️ Late fee applied for <strong>${f.name}</strong>!`,
                            type: 'danger'
                        });
                    }
                }
            });
            setNotifications(newNotifs);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    if (!user) return null;

    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    return (
        <>
            <nav className={`navbar navbar-expand-lg navbar-dark dynamic-navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
                <div className="container">
                    <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/">
                        <img src="https://img.icons8.com/isometric/50/coins.png" width="30" className="me-2" alt="Logo" />
                        <span style={{ letterSpacing: '-0.5px' }}>Smart Fund</span>
                    </Link>

                    <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                            <li className="nav-item">
                                <NavLink
                                    className={({ isActive }) => `nav-link fw-medium px-3 text-white ${isActive ? 'active' : ''}`}
                                    to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
                                >
                                    Dashboard
                                </NavLink>
                            </li>
                            {user.role === 'admin' ? (
                                <>
                                    <li className="nav-item"><NavLink className="nav-link fw-medium px-3 text-white" to="/admin/funds">Manage Funds</NavLink></li>
                                    <li className="nav-item"><NavLink className="nav-link fw-medium px-3 text-white" to="/admin/users">Manage Users</NavLink></li>
                                    <li className="nav-item"><NavLink className="nav-link fw-medium px-3 text-white" to="/admin/payments">Payments</NavLink></li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <NavLink className="nav-link fw-medium px-3 text-white" to="/user/passbook">My Passbook</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link fw-medium px-3 text-white" to="/user/wallet">My Wallet</NavLink>
                                    </li>
                                </>
                            )}
                        </ul>

                        <div className="d-flex align-items-center mt-3 mt-lg-0">
                            <div className="dropdown me-3">
                                <button className="btn btn-sm text-white position-relative border-0" type="button" data-bs-toggle="dropdown">
                                    <i className="bi bi-bell-fill fs-5"></i>
                                    {notifications.length > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                                            <span className="visually-hidden">New alerts</span>
                                        </span>
                                    )}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 animate-fade-in" style={{ width: '300px', borderRadius: '15px' }}>
                                    <li><h6 className="dropdown-header text-uppercase small fw-bold">Notifications</h6></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    {notifications.length === 0 ? (
                                        <li className="text-center text-muted small py-3">No new notifications</li>
                                    ) : (
                                        notifications.map((note, index) => (
                                            <li key={index}>
                                                <div className={`dropdown-item small text-wrap py-2 ${note.type === 'danger' ? 'text-danger' : 'text-warning'}`} dangerouslySetInnerHTML={{ __html: note.message }}></div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>

                            <button className="btn btn-sm text-white me-3 border-0 transition-all hover-scale" onClick={toggleTheme} title="Toggle Theme">
                                <i className={`bi bi-${theme === 'light' ? 'moon' : 'sun'}-fill fs-5`}></i>
                            </button>

                            {/* User Profile Dropdown */}
                            <div className="dropdown">
                                <button className="btn p-0 border-0 d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                                    <div className="text-end me-2 d-none d-md-block line-height-sm">
                                        <small className="d-block text-white-50" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Signed in as</small>
                                        <span className="fw-bold text-white small">{user.name}</span>
                                    </div>
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm transition-all hover-scale"
                                        style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', fontSize: '1rem', border: '2px solid rgba(255,255,255,0.1)' }}
                                    >
                                        {initials}
                                    </div>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 animate-fade-in" style={{ borderRadius: '15px', minWidth: '180px' }}>
                                    <li className="p-3 border-bottom d-md-none text-center">
                                        <div className="fw-bold small">{user.name}</div>
                                        <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{user.email}</div>
                                    </li>
                                    <li><button className="dropdown-item py-2 d-flex align-items-center" onClick={() => navigate('/profiles')}>
                                        <i className="bi bi-person me-2"></i>My Profile
                                    </button></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item py-2 d-flex align-items-center text-danger" onClick={logout}>
                                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                                    </button></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            {/* Nav spacer for fixed nav */}
            <div style={{ height: scrolled ? '70px' : '85px', transition: 'var(--transition)' }}></div>
        </>
    );
};


export default Navbar;
