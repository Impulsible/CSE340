const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock user database - REPLACE WITH REAL DATABASE
const users = [
    {
        id: 1,
        email: 'user@example.com',
        password: 'password123', // In real app, use bcrypt for hashing
        role: 'user'
    },
    {
        id: 2, 
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
    }
];

// POST /auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // 1. Find user
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Create JWT payload (don't include password!)
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };

    // 3. Generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: '1h' 
    });

    // 4. Set cookie
    res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, // 1 hour
        sameSite: 'strict'
    });

    // 5. Send response
    res.json({
        message: 'Login successful',
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: 'Logged out successfully' });
});

// GET /auth/me - Get current user info
router.get('/me', (req, res) => {
    const token = req.cookies.authToken;
    
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ user });
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
});

module.exports = router;