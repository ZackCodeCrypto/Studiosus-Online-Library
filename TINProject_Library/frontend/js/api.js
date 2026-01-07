const API_BASE = '';

function getToken() {
    return localStorage.getItem('studiosus_token');
}

async function apiGet(path) {
    const token = getToken();
    const res = await fetch(API_BASE + path, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error(await res.text());
    if (handleAuthFailure(res)) return;
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function apiSend(path, method, data) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(API_BASE + path, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
    });

    const text = await res.text();
    let json;
    try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

    if (!res.ok) throw new Error(json.error || json.message || text || `${method} ${path} failed`);
    if (handleAuthFailure(res)) return;
    if (!res.ok) throw new Error(await res.text());
    return json;
}

function handleAuthFailure(res) {
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('studiosus_token');
        localStorage.removeItem('studiosus_user');
        location.href = '/login.html';
        return true;
    }
    return false;
}

