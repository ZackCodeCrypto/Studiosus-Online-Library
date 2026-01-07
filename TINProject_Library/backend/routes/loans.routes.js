const express = require('express');
const router = express.Router();
const loansService = require('../services/loans.service');
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

            let total, data;

            if (req.user.role === 'admin') {
                total = await loansService.countLoans(db);
                data = await loansService.getLoansPage(db, limit, offset);
            } else {
                total = await loansService.countLoansByUser(db, req.user.id);
                data = await loansService.getLoansPageByUser(db, req.user.id, limit, offset);
            }

            res.json({
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                data
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Could not get loans' });
        }
    });



    router.post('/', auth, requireRole('admin'), async (req, res) => {
        const { user_id, book_id, loan_date } = req.body;

        if (!user_id || !book_id) {
            return res.status(400).json({ error: 'user id and book id required' });
        }

        try {
            const result = await loansService.createLoan(db, {
                user_id,
                book_id,
                loan_date
            });

            res.status(201).json({
                message: 'Loan created',
                loanId: result.id
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to create a loan' });
        }
    });

    router.put('/:id', auth, requireRole('admin'), async (req, res) => {
        const id = Number(req.params.id);
        const { loan_date, return_date } = req.body;

        if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
        if (!loan_date) return res.status(400).json({ error: 'loan date is required' });

        try {
            const result = await loansService.updateLoan(db, id, { loan_date, return_date: return_date || null });
            if (result.changes === 0) return res.status(404).json({ error: 'Loan not found' });

            res.json({ message: 'Loan updated' });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to update a loan' });
        }
    });

    router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

        try {
            const result = await loansService.deleteLoan(db, id);
            if (result.changes === 0) return res.status(404).json({ error: 'Loan not found' });

            res.json({ message: 'Loan deleted' });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to delete a loan' });
        }
    });

    return router;
};
