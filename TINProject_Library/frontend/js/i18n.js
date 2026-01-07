const I18N = {
    en: {
        appName: "Studiosus Online Library",
        home: "Home",
        books: "Books",
        users: "Users",
        loans: "Loans",
        login: "Login",
        register: "Register",
        logout: "Logout",

        list: "List",
        detailView: "Detail View",
        refresh: "Refresh",
        prev: "Prev",
        next: "Next",
        limit: "Limit",
        actions: "Actions",
        view: "View",

        id: "ID",
        title: "Title",
        author: "Author",
        year: "Year",
        username: "Username",
        role: "Role",

        loanDate: "Loan Date",
        returnDate: "Return Date",

        selectBook: "Select a book...",
        selectUser: "Select a user...",

        page: "Page",
        total: "Total",
        loansRelationships: "Loans (Relationships)",
        user: "User",

        add: "Add",
        update: "Update",
        delete: "Delete",

        notFound: "Not found",
        noLoansForBook: "No loans for this book.",
        noLoansForUser: "No loans for this user.",
        noLoans: "No loans.",
        welcomeTitle: "Hello, welcome to Studiosus Online Library!",
        welcomeText1: "We offer a wide variety of books available in our system. Browse them by selecting the Books tab.",
        welcomeText2: "Join us and become one of our educated and highly respected users by registering today using the Register button.",
        welcomeText3: "Already a member? Log in to view our catalog.",
        welcomeText4: "Borrowed a book? Check the status of your loans in the Loans tab.",

        book: "Book",
        userId: "User ID",
        bookId: "Book ID",
        loanId: "Loan ID",
        loanDateInput: "Loan Date (YYYY-MM-DD)",
        returnDateInput: "Return Date (YYYY-MM-DD or blank)",
        selectLoan: "Select a loan...",
        errorLoading: "Error loading data. Try Refresh.",

        loginTitle: "Studiosus - Login",
        registerTitle: "Studiosus - Register",
        loginSuccessRedirect: "Logged in, Redirecting…",
        registerSuccessRedirect: "Registered! Now login…",
        usernameTooShort: "Username must be at least 2 characters",
        passwordTooShort: "Password must be at least 3 characters",
        rolePlaceholder: "Role (user/admin)"


    },

    pl: {
        appName: "Studiosus Biblioteka Online",
        home: "Strona główna",
        books: "Książki",
        users: "Użytkownicy",
        loans: "Wypożyczenia",
        login: "Logowanie",
        register: "Rejestracja",
        logout: "Wyloguj",

        list: "Lista",
        detailView: "Szczegóły",
        refresh: "Odśwież",
        prev: "Poprzednia",
        next: "Następna",
        limit: "Limit",
        actions: "Akcje",
        view: "Podgląd",

        id: "ID",
        title: "Tytuł",
        author: "Autor",
        year: "Rok",
        username: "Nazwa użytkownika",
        role: "Rola",

        page: "Strona",
        total: "Razem",
        loansRelationships: "Wypożyczenia (Relacje)",
        user: "Użytkownik",

        loanDate: "Data wypożyczenia",
        returnDate: "Data zwrotu",

        selectBook: "Wybierz książkę...",
        selectUser: "Wybierz użytkownika...",
        selectLoan: "Wybierz wypożyczenie...",

        add: "Dodaj",
        update: "Aktualizuj",
        delete: "Usuń",

        notFound: "Nie znaleziono",
        noLoansForBook: "Brak wypożyczeń dla tej książki.",
        noLoansForUser: "Brak wypożyczeń dla tego użytkownika.",
        noLoans: "Brak wypożyczeń.",
        welcomeTitle: "Witamy w Bibliotece Online Studiosus!",
        welcomeText1: "Oferujemy szeroki wybór książek dostępnych w naszym systemie. Możesz je przeglądać, wybierając zakładkę Książki.",
        welcomeText2: "Dołącz do nas i zostań jednym z naszych wykształconych oraz cenionych użytkowników, rejestrując się już dziś za pomocą przycisku Rejestracja.",
        welcomeText3: "Jesteś już członkiem? Zaloguj się, aby zobaczyć katalog.",
        welcomeText4: "Wypożyczyłeś książkę? Sprawdź status swoich wypożyczeń w zakładce Wypożyczenia.",
        book: "Książka",
        userId: "ID użytkownika",
        bookId: "ID książki",
        loanId: "ID wypożyczenia",
        loanDateInput: "Data wypożyczenia (RRRR-MM-DD)",
        returnDateInput: "Data zwrotu (RRRR-MM-DD lub puste)",
        errorLoading: "Błąd podczas ładowania danych. Spróbuj Odśwież.",
        loginTitle: "Studiosus - Logowanie",
        registerTitle: "Studiosus - Rejestracja",
        loginSuccessRedirect: "Zalogowano! Przekierowywanie…",
        registerSuccessRedirect: "Zarejestrowano! Teraz się zaloguj…",
        usernameTooShort: "Nazwa użytkownika musi mieć co najmniej 2 znaki",
        passwordTooShort: "Hasło musi mieć co najmniej 3 znaki",
        rolePlaceholder: "Rola (user/admin)"


    }
};

function getLang() {
    return localStorage.getItem("studiosus_lang") || "en";
}

function setLang(lang) {
    localStorage.setItem("studiosus_lang", lang);
}

function t(key) {
    const lang = getLang();
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}

function applyI18n(root = document) {
    root.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        el.textContent = t(key);
    });
    
    root.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        el.setAttribute("placeholder", t(key));
    });
}
