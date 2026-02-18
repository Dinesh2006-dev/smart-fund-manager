const express = require('express');
require('dotenv').config(); // Load env vars BEFORE anything else
const cors = require('cors');
const morgan = require('morgan');
const { initDb } = require('./src/config/db.js');

console.log('--- ENV DEBUG ---');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('-----------------');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database
initDb();

// Middleware
// express.json() allows the server to understand data sent in JSON format (common in web apps)
app.use(express.json());
// cors() allows requests from different origins (like your frontend)
app.use(cors());
// morgan('dev') logs every request to the terminal for debugging
app.use(morgan('dev'));

// Basic Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Routes
app.use('/api/auth', require('./src/routes/auth.routes.js'));
app.use('/api/funds', require('./src/routes/fund.routes.js'));
app.use('/api/users', require('./src/routes/user.routes.js'));
app.use('/api/payments', require('./src/routes/payment.routes.js'));
app.use('/api/dashboard', require('./src/routes/dashboard.routes.js'));

// Static files (Served AFTER API routes to avoid conflicts)
app.use(express.static('../public'));

// 404 Handler (JSON)
app.use((req, res) => {
    res.status(404).json({
        message: `API Route [${req.method}] ${req.url} not found`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
