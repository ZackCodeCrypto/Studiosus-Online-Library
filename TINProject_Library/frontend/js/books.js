const token = localStorage.getItem('studiosus_token');
if (!token) {
    location.href = '/';
}
const tableBody = document.querySelector('#booksTable tbody');
const detailBox = document.getElementById('detailBox');

document.getElementById('refreshBtn').addEventListener('click', loadBooks);
document.getElementById('addForm').addEventListener('submit', onAdd);
document.getElementById('updateForm').addEventListener('submit', onUpdate);
document.getElementById('deleteForm').addEventListener('submit', onDelete);

let page = 1;
let totalPages = 1;

document.getElementById('prevBtn').addEventListener('click', () => {
    if (page > 1) { page--; loadBooks(); }
});
document.getElementById('nextBtn').addEventListener('click', () => {
    if (page < totalPages) { page++; loadBooks(); }
});
document.getElementById('limitSel').addEventListener('change', () => {
    page = 1;
    loadBooks();
});

function setMsg(id, text, ok = true) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'msg ' + (ok ? 'ok' : 'err');
}

function validateBook({ title, author, year }) {
    if (!title || title.trim().length < 1) return 'Title is required';
    if (!author || author.trim().length < 1) return 'Author is required';
    if (year !== '' && year != null) {
        const y = Number(year);
        if (!Number.isInteger(y) || y < 0) return 'Year must be a positive integer (or empty)';
    }
    return null;
}

async function loadBooks() {
    tableBody.innerHTML = '';

    const limit = Number(document.getElementById('limitSel').value);
    const res = await apiGet(`/books?page=${page}&limit=${limit}`);

    totalPages = res.totalPages || 1;
    document.getElementById("pageInfo").textContent =
        `${t("page")} ${res.page} / ${totalPages} (${t("total")}: ${res.total})`;

    for (const b of res.data) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${b.id}</td>
      <td>${escapeHtml(b.title)}</td>
      <td>${escapeHtml(b.author)}</td>
      <td>${b.year ?? ''}</td>
      <td><button data-id="${b.id}" class="viewBtn">${t("view")}</button></td>
    `;
        tableBody.appendChild(tr);
    }

    document.querySelectorAll('.viewBtn').forEach(btn => {
        btn.addEventListener('click', () => showDetail(btn.dataset.id));
    });
}

async function showDetail(id) {
    const [booksRes, loansRes] = await Promise.all([
        apiGet('/books?page=1&limit=200'),
        apiGet('/loans?page=1&limit=500')
    ]);

    const books = booksRes.data;
    const loans = loansRes.data;

    const book = books.find(b => String(b.id) === String(id));
    if (!book) {
        detailBox.textContent = 'Not found';
        return;
    }

    const relatedLoans = loans.filter(l => String(l.book_id) === String(book.id));

    const loansHtml = relatedLoans.length === 0
        ? `<p><i>${t("noLoansForBook")}</i></p>`
        : `
    <table>
      <thead>
        <tr>
          <th>${t("user")}</th>
          <th>${t("loanDate")}</th>
          <th>${t("returnDate")}</th>
        </tr>
      </thead>
      <tbody>
        ${relatedLoans.map(l => `
          <tr>
            <td>${escapeHtml(l.username ?? "")}</td>
            <td>${escapeHtml(l.loan_date ?? "")}</td>
            <td>${escapeHtml(l.return_date ?? "")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

    detailBox.innerHTML = `
    <p><b>${t("id")}:</b> ${book.id}</p>
    <p><b>${t("title")}:</b> ${escapeHtml(book.title)}</p>
    <p><b>${t("author")}:</b> ${escapeHtml(book.author)}</p>
    <p><b>${t("year")}:</b> ${book.year ?? ""}</p>
    <hr>
    <h3>${t("loansRelationships")}</h3>
    ${loansHtml}
  `;
}



async function onAdd(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    const err = validateBook(data);
    if (err) return setMsg('addMsg', err, false);

    try {
        await apiSend('/books', 'POST', {
            title: data.title.trim(),
            author: data.author.trim(),
            year: data.year === '' ? null : Number(data.year)
        });
        setMsg('addMsg', 'Book added');
        e.target.reset();
        loadBooks();
    } catch (ex) {
        setMsg('addMsg', ex.message, false);
    }
}

async function onUpdate(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    const id = Number(data.id);
    if (!Number.isInteger(id)) return setMsg('updateMsg', 'Valid ID required', false);

    const err = validateBook(data);
    if (err) return setMsg('updateMsg', err, false);

    try {
        await apiSend(`/books/${id}`, 'PUT', {
            title: data.title.trim(),
            author: data.author.trim(),
            year: data.year === '' ? null : Number(data.year)
        });
        setMsg('updateMsg', 'Book updated');
        loadBooks();
    } catch (ex) {
        setMsg('updateMsg', ex.message, false);
    }
}

async function onDelete(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const id = Number(data.id);
    if (!Number.isInteger(id)) return setMsg('deleteMsg', 'Valid ID required', false);

    try {
        await apiSend(`/books/${id}`, 'DELETE');
        setMsg('deleteMsg', 'Book deleted');
        loadBooks();
    } catch (ex) {
        setMsg('deleteMsg', ex.message, false);
    }
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[s]));
}

function getUser() {
    try { return JSON.parse(localStorage.getItem('studiosus_user') || 'null'); }
    catch { return null; }
}

const user = getUser();
const isAdmin = user && user.role === 'admin';

if (!isAdmin) {
    document.getElementById('addForm')?.closest('.card')?.remove();
    document.getElementById('updateForm')?.closest('.card')?.remove();
    document.getElementById('deleteForm')?.closest('.card')?.remove();
}

loadBooks();
