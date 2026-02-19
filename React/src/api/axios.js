import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Pointing to existing backend
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add interceptor for Authorization token if found in localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
