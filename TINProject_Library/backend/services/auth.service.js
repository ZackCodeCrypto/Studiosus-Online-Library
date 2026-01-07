const bcrypt = require('bcryptjs');

function findUserByUsername(db, username) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT id, username, password, role FROM users WHERE username = ?',
            [username],
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}

function createUser(db, { username, passwordHash, role }) {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, passwordHash, role],
            function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            }
        );
    });
}

async function register(db, { username, password, role }) {
    const existing = await findUserByUsername(db, username);
    if (existing) {
        const err = new Error('Username already exists');
        err.status = 409;
        throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await createUser(db, {
        username,
        passwordHash,
        role: role || 'user'
    });

    return { id: result.id, username, role: role || 'user' };
}

async function login(db, { username, password }) {
    const user = await findUserByUsername(db, username);
    if (!user) {
        const err = new Error('Invalid credentials');
        err.status = 401;
        throw err;
    }
    
    const stored = user.password || '';
    let ok = false;

    if (stored.startsWith('$2')) {
        ok = await bcrypt.compare(password, stored);
    } else {
        ok = password === stored;
        if (ok) {
            const newHash = await bcrypt.hash(password, 10);
            await new Promise((resolve, reject) => {
                db.run('UPDATE users SET password = ? WHERE id = ?', [newHash, user.id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
    }

    if (!ok) {
        const err = new Error('Invalid credentials');
        err.status = 401;
        throw err;
    }

    return { id: user.id, username: user.username, role: user.role };
}

module.exports = {
    register,
    login
};
