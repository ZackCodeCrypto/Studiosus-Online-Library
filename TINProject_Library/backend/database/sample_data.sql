INSERT INTO users (username, password, role)
VALUES
    ('Linda Gerry', 'lgerry123', 'admin'),
    ('Alice Myersdale', 'password', 'user');

INSERT INTO books (title, author, year)
VALUES
    ('1984', 'George Orwell', 1949),
    ('The Hobbit', 'J.R.R. Tolkien', 1937);

INSERT INTO loans (user_id, book_id, loan_date)
VALUES
    (2, 1, '2025-01-10');
