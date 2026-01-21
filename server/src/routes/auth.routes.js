const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // 1. Check if user already exists
        const existingUser = await db('users').where({ email }).first();
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash the password (encrypt it)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save user to database
        await db('users').insert({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            phone,
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await db('users').where({ email }).first();
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 2. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Create a JWT token (a digital pass that proves they are logged in)
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: '1d',
        });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

const { sendOTPEmail } = require('../services/mailService');

// ... (existing register and login routes)

// Forgot Password - Request OTP
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await db('users').where({ email }).first();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        await db('users').where({ id: user.id }).update({
            reset_otp: otp,
            reset_otp_expiry: expiry,
        });

        console.log('-----------------------------------------');
        console.log(`DEBUG OTP: ${otp} (for ${email})`);
        console.log('-----------------------------------------');

        const sent = await sendOTPEmail(email, otp);
        if (sent) {
            res.json({ message: 'OTP sent to your email' });
        } else {
            res.status(500).json({ message: 'Error sending email' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await db('users').where({ email, reset_otp: otp }).first();

        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date(user.reset_otp_expiry) < new Date()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        res.json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await db('users').where({ email, reset_otp: otp }).first();

        if (!user || new Date(user.reset_otp_expiry) < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db('users').where({ id: user.id }).update({
            password: hashedPassword,
            reset_otp: null,
            reset_otp_expiry: null,
        });

        res.json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
