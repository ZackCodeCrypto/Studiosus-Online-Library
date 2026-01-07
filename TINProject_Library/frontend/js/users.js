const token = localStorage.getItem('studiosus_token');
if (!token) {
    location.href = '/';
}

if (window.__usersPageInit) {
    console.warn("users.js already initialized");
} else {
    window.__usersPageInit = true;
    document.getElementById('refreshBtn').addEventListener('click', loadUsers);
    document.getElementById('addForm').addEventListener('submit', onAdd);
    document.getElementById('updateForm').addEventListener('submit', onUpdate);
    document.getElementById('deleteForm').addEventListener('submit', onDelete);

    document.getElementById('prevBtn').addEventListener('click', () => {
        if (page > 1) { page--; loadUsers(); }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (page < totalPages) { page++; loadUsers(); }
    });

    document.getElementById('limitSel').addEventListener('change', () => {
        page = 1;
        loadUsers();
    });
}
const tableBody = document.querySelector('#usersTable tbody');

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

function validateUser({ username, password, role }) {
    if (!username || username.trim().length < 2) return 'Username must be at least 2 characters';
    if (!password || password.length < 8) return 'Password must be at least 8 characters';
    if (role && !['user', 'admin'].includes(role.trim().toLowerCase())) return 'Role must be user or admin';
    return null;
}

async function loadUsers() {
    tableBody.innerHTML = '';

    try {
        const limit = Number(document.getElementById('limitSel').value);
        const res = await apiGet(`/users?page=${page}&limit=${limit}`);

        totalPages = res.totalPages || 1;
        document.getElementById("pageInfo").textContent =
            `${t("page")} ${res.page} / ${totalPages} (${t("total")}: ${res.total})`;

        for (const u of res.data) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${u.id}</td>
        <td>${escapeHtml(u.username)}</td>
        <td>${escapeHtml(u.role ?? '')}</td>
        <td><button data-id="${u.id}" class="viewBtn">${t("view")}</button></td>
      `;
            tableBody.appendChild(tr);
        }
    } catch (err) {
        console.error(err);
        document.getElementById("pageInfo").textContent = t("errorLoading");
        setMsg?.("addMsg", t("errorLoading"), false);
    }
}



async function showDetail(id) {
    const [usersRes, loansRes] = await Promise.all([
        apiGet(`/users?page=1&limit=500`),
        apiGet(`/loans?page=1&limit=1000`)
    ]);

    const users = usersRes.data || [];
    const loans = loansRes.data || [];

    const userObj = users.find(u => String(u.id) === String(id));
    if (!userObj) {
        detailBox.textContent = t("notFound");
        return;
    }
    
    const relatedLoans = loans.filter(l =>
        (l.user_id != null && String(l.user_id) === String(userObj.id)) ||
        (l.username != null && String(l.username) === String(userObj.username))
    );

    const loansHtml = relatedLoans.length === 0
        ? `<p><i>${t("noLoansForUser")}</i></p>`
        : `
      <table>
        <thead>
          <tr>
            <th>${t("book")}</th>
            <th>${t("loanDate")}</th>
            <th>${t("returnDate")}</th>
          </tr>
        </thead>
        <tbody>
          ${relatedLoans.map(l => `
            <tr>
              <td>${escapeHtml(l.title ?? "")}</td>
              <td>${escapeHtml(l.loan_date ?? "")}</td>
              <td>${escapeHtml(l.return_date ?? "")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    detailBox.innerHTML = `
      <h3>${t("detailView")}</h3>
      <p><b>${t("id")}:</b> ${userObj.id}</p>
      <p><b>${t("username")}:</b> ${escapeHtml(userObj.username)}</p>
      <p><b>${t("role")}:</b> ${escapeHtml(userObj.role ?? "")}</p>
      <hr>
      <h3>${t("loansRelationships")}</h3>
      ${loansHtml}
    `;
}

async function onAdd(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    const err = validateUser(data);
    if (err) return setMsg('addMsg', err, false);

    try {
        await apiSend('/users', 'POST', {
            username: data.username.trim(),
            password: data.password,
            role: (data.role || 'user').trim().toLowerCase()
        });
        setMsg('addMsg', 'User added');
        e.target.reset();
        e.target.role.value = 'user';
        loadUsers();
    } catch (ex) {
        setMsg('addMsg', ex.message, false);
    }
}

async function onUpdate(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const id = Number(data.id);
    if (!Number.isInteger(id)) return setMsg('updateMsg', 'Valid ID required', false);

    const err = validateUser(data);
    if (err) return setMsg('updateMsg', err, false);

    try {
        await apiSend(`/users/${id}`, 'PUT', {
            username: data.username.trim(),
            password: data.password,
            role: (data.role || 'user').trim().toLowerCase()
        });
        setMsg('updateMsg', 'User updated');
        loadUsers();
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
        await apiSend(`/users/${id}`, 'DELETE');
        setMsg('deleteMsg', 'User deleted');
        loadUsers();
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


loadUsers();
