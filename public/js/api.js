const API_URL = '/api';

// Helper to handle API requests
async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['x-auth-token'] = token;
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        const text = await response.text();
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status} ${response.statusText}`);
        }
        return text;
    }

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}

// Auth Helpers
const Auth = {
    login: (email, password) => apiRequest('/auth/login', 'POST', { email, password }),
    register: (userData) => apiRequest('/auth/register', 'POST', userData),
    getToken: () => localStorage.getItem('token'),
    getUser: () => JSON.parse(localStorage.getItem('user')),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    },
    isLoggedIn: () => !!localStorage.getItem('token'),
    isAdmin: () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user && user.role === 'admin';
    },
    forgotPassword: (email) => apiRequest('/auth/forgot-password', 'POST', { email }),
    resetPassword: (email, otp, newPassword) => apiRequest('/auth/reset-password', 'POST', { email, otp, newPassword })
};
