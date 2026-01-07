const express = require('express');
const router = express.Router();
const booksService = require('../services/books.service');
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

            const total = await booksService.countBooks(db);
            const data = await booksService.getBooksPage(db, limit, offset);

            res.json({
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                data
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to fetch books' });
        }
    });

    router.post('/', auth, requireRole('admin'), async (req, res) => {
        const { title, author, year } = req.body;

        if (!title || !author) {
            return res.status(400).json({ error: 'Title and author are required' });
        }

        try {
            const result = await booksService.createBook(db, {
                title,
                author,
                year
            });

            res.status(201).json({
                message: 'Book created',
                bookId: result.id
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to create book' });
        }
    });

    router.put('/:id', auth, requireRole('admin'), async (req, res) => {
        const id = Number(req.params.id);
        const { title, author, year } = req.body;

        if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
        if (!title || !author) return res.status(400).json({ error: 'Title and author are required' });

        try {
            const result = await booksService.updateBook(db, id, { title, author, year });
            if (result.changes === 0) return res.status(404).json({ error: 'Book not found' });

            res.json({ message: 'Book updated' });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to update book' });
        }
    });

    router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

        try {
            const result = await booksService.deleteBook(db, id);
            if (result.changes === 0) return res.status(404).json({ error: 'Book not found' });

            res.json({ message: 'Book deleted' });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to delete book' });
        }
    });

    return router;
};
