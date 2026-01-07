const jwt = require('jsonwebtoken');

function requireAuth(JWT_SECRET) {
    return (req, res, next) => {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;

        if (!token) return res.status(401).json({ error: 'Missing token' });

        try {
            const payload = jwt.verify(token, JWT_SECRET);
            req.user = payload; // { id, username, role }
            next();
        } catch {
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
}

function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
        if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
        next();
    };
}

module.exports = { requireAuth, requireRole };
