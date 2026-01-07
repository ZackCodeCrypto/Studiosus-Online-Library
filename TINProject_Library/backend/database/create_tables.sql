DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS books;

CREATE TABLE users (
                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                       username TEXT NOT NULL UNIQUE,
                       password TEXT NOT NULL,
                       role TEXT NOT NULL
);

CREATE TABLE books (
                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                       title TEXT NOT NULL,
                       author TEXT NOT NULL,
                       year INTEGER
);

CREATE TABLE loans (
                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                       user_id INTEGER NOT NULL,
                       book_id INTEGER NOT NULL,
                       loan_date TEXT NOT NULL,
                       return_date TEXT,
                       FOREIGN KEY (user_id) REFERENCES users(id),
                       FOREIGN KEY (book_id) REFERENCES books(id)
);
