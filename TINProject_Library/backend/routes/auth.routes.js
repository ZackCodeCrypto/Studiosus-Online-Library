const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authService = require('../services/auth.service');

module.exports = (db, JWT_SECRET) => {

    router.post('/register', async (req, res) => {
        const { username, password } = req.body;

        if (!username || username.trim().length < 2) {
            return res.status(400).json({ error: 'Username must be at least 2 characters' });
        }
        if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        try {
            const user = await authService.register(db, {
                username: username.trim(),
                password,
                role: 'user'
            });

            res.status(201).json({ message: 'Registered', user });
        } catch (err) {
            res.status(err.status || 500).json({ error: err.message || 'Register failed' });
        }
    });

    router.post('/login', async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        try {
            const user = await authService.login(db, { username: username.trim(), password });

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '2h' }
            );

            res.json({ message: 'Logged in', token, user });
        } catch (err) {
            res.status(err.status || 500).json({ error: err.message || 'Login failed' });
        }
    });

    router.get('/me', (req, res) => {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token) return res.status(401).json({ error: 'Missing token' });

        try {
            const payload = jwt.verify(token, JWT_SECRET);
            res.json({ user: payload });
        } catch {
            res.status(401).json({ error: 'Invalid token' });
        }
    });

    return router;
};
