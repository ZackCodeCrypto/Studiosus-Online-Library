const token = localStorage.getItem('studiosus_token');
if (!token) {
    location.href = '/';
}

if (window.__loansPageInit) {
    console.warn("loans.js already initialized");
} else {
    window.__loansPageInit = true;
    document.getElementById('refreshBtn').addEventListener('click', loadLoans);
    document.getElementById('addForm').addEventListener('submit', onAdd);
    document.getElementById('updateForm').addEventListener('submit', onUpdate);
    document.getElementById('deleteForm').addEventListener('submit', onDelete);

    document.getElementById('prevBtn').addEventListener('click', () => {
        if (page > 1) { page--; loadLoans(); }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (page < totalPages) { page++; loadLoans(); }
    });

    document.getElementById('limitSel').addEventListener('change', () => {
        page = 1;
        loadLoans();
    });
}
const tableBody = document.querySelector('#loansTable tbody');

if (!tableBody.dataset.clickBound) {
    tableBody.dataset.clickBound = "1";
    tableBody.addEventListener("click", (e) => {
        const btn = e.target.closest(".viewBtn");
        if (!btn) return;
        showDetail(btn.dataset.id);
    });
}

const detailBox = document.getElementById('detailBox');

let page = 1;
let totalPages = 1;


function setMsg(id, text, ok = true) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'msg ' + (ok ? 'ok' : 'err');
}

function isValidDate(str) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(str || '').trim());
}

function validateLoanCreate({ user_id, book_id, loan_date }) {
    if (!Number.isInteger(Number(user_id))) return 'Valid user_id required';
    if (!Number.isInteger(Number(book_id))) return 'Valid book_id required';
    if (!isValidDate(loan_date)) return 'loan_date must be YYYY-MM-DD';
    return null;
}

function validateLoanUpdate({ loan_date, return_date }) {
    if (!isValidDate(loan_date)) return 'loan_date must be YYYY-MM-DD';
    if (return_date && return_date.trim() !== '' && !isValidDate(return_date)) return 'return_date must be YYYY-MM-DD or blank';
    return null;
}

async function loadLoans() {
    tableBody.innerHTML = '';

    const limit = Number(document.getElementById('limitSel').value);
    const res = await apiGet(`/loans?page=${page}&limit=${limit}`);

    totalPages = res.totalPages || 1;
    document.getElementById("pageInfo").textContent =
        `${t("page")} ${res.page} / ${totalPages} (${t("total")}: ${res.total})`;

    for (const l of res.data) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${l.id}</td>
      <td>${escapeHtml(l.username ?? '')}</td>
      <td>${escapeHtml(l.title ?? '')}</td>
      <td>${escapeHtml(l.loan_date ?? '')}</td>
      <td>${escapeHtml(l.return_date ?? '')}</td>
      <td><button data-id="${l.id}" class="viewBtn">${t("view")}</button></td>
    `;
        tableBody.appendChild(tr);
    }
}

async function showDetail(id) {
    const res = await apiGet(`/loans?page=1&limit=2000`);
    const loans = res.data || [];

    const loan = loans.find(l => String(l.id) === String(id));
    if (!loan) {
        detailBox.textContent = t("notFound");
        return;
    }

    detailBox.innerHTML = `
      <h3>${t("detailView")}</h3>
      <p><b>${t("id")}:</b> ${loan.id}</p>
      <p><b>${t("user")}:</b> ${escapeHtml(loan.username ?? "")}</p>
      <p><b>${t("book")}:</b> ${escapeHtml(loan.title ?? "")}</p>
      <p><b>${t("loanDate")}:</b> ${escapeHtml(loan.loan_date ?? "")}</p>
      <p><b>${t("returnDate")}:</b> ${escapeHtml(loan.return_date ?? "")}</p>
    `;
}



async function onAdd(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    const err = validateLoanCreate(data);
    if (err) return setMsg('addMsg', err, false);

    try {
        await apiSend('/loans', 'POST', {
            user_id: Number(data.user_id),
            book_id: Number(data.book_id),
            loan_date: data.loan_date.trim()
        });
        setMsg('addMsg', 'Loan added');
        e.target.reset();
        loadLoans();
    } catch (ex) {
        setMsg('addMsg', ex.message, false);
    }
}

async function onUpdate(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const id = Number(data.id);
    if (!Number.isInteger(id)) return setMsg('updateMsg', 'Valid loan ID required', false);

    const err = validateLoanUpdate(data);
    if (err) return setMsg('updateMsg', err, false);

    try {
        await apiSend(`/loans/${id}`, 'PUT', {
            loan_date: data.loan_date.trim(),
            return_date: data.return_date.trim() === '' ? null : data.return_date.trim()
        });
        setMsg('updateMsg', 'Loan updated');
        loadLoans();
    } catch (ex) {
        setMsg('updateMsg', ex.message, false);
    }
}

async function onDelete(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const id = Number(data.id);
    if (!Number.isInteger(id)) return setMsg('deleteMsg', 'Valid loan ID required', false);

    try {
        await apiSend(`/loans/${id}`, 'DELETE');
        setMsg('deleteMsg', 'Loan deleted');
        loadLoans();
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


loadLoans();
