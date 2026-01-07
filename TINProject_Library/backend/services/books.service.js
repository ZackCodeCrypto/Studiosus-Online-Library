function createBook(db, book) {
    return new Promise((resolve, reject) => {
        const { title, author, year } = book;

        const sql = `
            INSERT INTO books (title, author, year)
            VALUES (?, ?, ?)
        `;

        db.run(sql, [title, author, year], function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
        });
    });
}

function updateBook(db, id, book) {
    return new Promise((resolve, reject) => {
        const { title, author, year } = book;

        const sql = `
      UPDATE books
      SET title = ?, author = ?, year = ?
      WHERE id = ?
    `;

        db.run(sql, [title, author, year, id], function (err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

function deleteBook(db, id) {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM books WHERE id = ?`;

        db.run(sql, [id], function (err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

function countBooks(db) {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) AS total FROM books', [], (err, row) => {
            if (err) reject(err);
            else resolve(row.total);
        });
    });
}

function getBooksPage(db, limit, offset) {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT id, title, author, year
      FROM books
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
    createBook,
    updateBook,
    deleteBook,
    getBooksPage,
    countBooks
};
