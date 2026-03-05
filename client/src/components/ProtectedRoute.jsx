import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/');
        } else if (requiredRole && user?.role !== requiredRole) {
            // If user role doesn't match, maybe go to their dashboard or home
            navigate(user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
        }
    }, [token, user, requiredRole, navigate]);

    if (!token || (requiredRole && user?.role !== requiredRole)) {
        return null; // or a loading spinner while redirecting
    }

    return children;
};

export default ProtectedRoute;
