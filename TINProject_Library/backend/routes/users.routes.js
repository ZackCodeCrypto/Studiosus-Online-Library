const express = require('express');
const router = express.Router();
const usersService = require('../services/users.service');
const { requireAuth, requireRole } = require('../middleware/auth');

function parsePagination(req) {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limitRaw = parseInt(req.query.limit || '10', 10);
    const limit = Math.min(50, Math.max(1, isNaN(limitRaw) ? 10 : limitRaw));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
}



module.exports = (db, JWT_SECRET) => {
    const auth = requireAuth(JWT_SECRET);

    router.get('/', auth, async (req, res) => {
        try {
            const { page, limit, offset } = parsePagination(req);

            const total = await usersService.countUsers(db);
            const data = await usersService.getUsersPage(db, limit, offset);

            res.json({
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                data
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    });


    router.post('/', auth, requireRole('admin'), async (req, res) => {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: 'Username and password are required'
            });
        }

        try {
            const result = await usersService.createUser(db, {
                username,
                password,
                role: role || 'user'
            });

            res.status(201).json({
                message: 'User created',
                userId: result.id
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to create user' });
        }
    });

    router.put('/:id', auth, requireRole('admin'), async (req, res) => {
        const id = Number(req.params.id);
        const { username, password, role } = req.body;

        if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
        if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

        try {
            const result = await usersService.updateUser(db, id, { username, password, role: role || 'user' });
            if (result.changes === 0) return res.status(404).json({ error: 'User not found' });

            res.json({ message: 'User updated' });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to update user' });
        }
    });

    router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

        try {
            const result = await usersService.deleteUser(db, id);
            if (result.changes === 0) return res.status(404).json({ error: 'User not found' });

            res.json({ message: 'User deleted' });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    });

    return router;
};
