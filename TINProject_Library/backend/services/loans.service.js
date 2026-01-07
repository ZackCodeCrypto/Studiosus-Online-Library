function createLoan(db, loan) {
    return new Promise((resolve, reject) => {
        const { user_id, book_id, loan_date } = loan;

        const sql = `
            INSERT INTO loans (user_id, book_id, loan_date)
            VALUES (?, ?, ?)
        `;

        db.run(sql, [user_id, book_id, loan_date], function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
        });
    });
}

function updateLoan(db, id, loan) {
    return new Promise((resolve, reject) => {
        const { loan_date, return_date } = loan;

        const sql = `
      UPDATE loans
      SET loan_date = ?, return_date = ?
      WHERE id = ?
    `;

        db.run(sql, [loan_date, return_date, id], function (err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

function deleteLoan(db, id) {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM loans WHERE id = ?`;

        db.run(sql, [id], function (err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

function countLoans(db) {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) AS total FROM loans', [], (err, row) => {
            if (err) reject(err);
            else resolve(row.total);
        });
    });
}

function getLoansPage(db, limit, offset) {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT
        loans.id AS id,
        loans.user_id AS user_id,
        loans.book_id AS book_id,
        users.username AS username,
        books.title AS title,
        loans.loan_date AS loan_date,
        loans.return_date AS return_date
      FROM loans
      JOIN users ON loans.user_id = users.id
      JOIN books ON loans.book_id = books.id
      ORDER BY loans.id DESC
      LIMIT ? OFFSET ?
    `;

        db.all(sql, [limit, offset], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function countLoansByUser(db, userId) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT COUNT(*) AS total FROM loans WHERE user_id = ?',
            [userId],
            (err, row) => {
                if (err) reject(err);
                else resolve(row.total);
            }
        );
    });
}

function getLoansPageByUser(db, userId, limit, offset) {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT
        loans.id AS id,
        loans.user_id AS user_id,
        loans.book_id AS book_id,
        users.username AS username,
        books.title AS title,
        loans.loan_date AS loan_date,
        loans.return_date AS return_date
      FROM loans
      JOIN users ON loans.user_id = users.id
      JOIN books ON loans.book_id = books.id
      WHERE loans.user_id = ?
      ORDER BY loans.id DESC
      LIMIT ? OFFSET ?
    `;
        db.all(sql, [userId, limit, offset], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}



module.exports = {
    createLoan,
    updateLoan,
    deleteLoan,
    getLoansPage,
    countLoans,
    countLoansByUser,
    getLoansPageByUser
};
