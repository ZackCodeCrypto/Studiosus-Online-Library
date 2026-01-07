const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath);

function runSQL(file) {
    const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

(async () => {
    try {
        await runSQL('create_tables.sql');
        console.log('Tables created.');

        await runSQL('sample_data.sql');
        console.log('Sample data inserted.');
    } catch (err) {
        console.error('Setup failed:', err.message);
    } finally {
        db.close();
    }
})();
