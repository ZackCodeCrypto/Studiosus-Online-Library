const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const JWT_SECRET = process.env.JWT_SECRET || 'studiosus_dev_secret';


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Database
const dbPath = path.join(__dirname, 'database', 'library.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Routes
const booksRoutes = require('./routes/books.routes')(db, JWT_SECRET);
const usersRoutes = require('./routes/users.routes')(db, JWT_SECRET);
const loansRoutes = require('./routes/loans.routes')(db, JWT_SECRET);
const authRoutes = require('./routes/auth.routes')(db, JWT_SECRET);

// Root
app.get('/', (req, res) => {
    res.send('Library backend is running!');
});

// Mount routes
app.use('/books', booksRoutes);
app.use('/users', usersRoutes);
app.use('/loans', loansRoutes);
app.use('/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
