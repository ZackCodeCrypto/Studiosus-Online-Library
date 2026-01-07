function createUser(db, user) {
    return new Promise((resolve, reject) => {
        const { username, password, role } = user;

        const sql = `
            INSERT INTO users (username, password, role)
            VALUES (?, ?, ?)
        `;

        db.run(sql, [username, password, role], function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
        });
    });
}

function updateUser(db, id, user) {
    return new Promise((resolve, reject) => {
        const { username, password, role } = user;

        const sql = `
      UPDATE users
      SET username = ?, password = ?, role = ?
      WHERE id = ?
    `;

        db.run(sql, [username, password, role, id], function (err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

function deleteUser(db, id) {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM users WHERE id = ?`;

        db.run(sql, [id], function (err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

function countUsers(db) {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) AS total FROM users', [], (err, row) => {
            if (err) reject(err);
            else resolve(row.total);
        });
    });
}

function getUsersPage(db, limit, offset) {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT id, username, role
      FROM users
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;
        db.all(sql, [limit, offset], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}


module.exports = {
    createUser,
    updateUser,
    deleteUser,
    getUsersPage,
    countUsers
};
