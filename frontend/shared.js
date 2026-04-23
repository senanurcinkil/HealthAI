// ── API CONFIG ────────────────────────────────────────────────────
const API_BASE = 'http://127.0.0.1:8080';

// ── TOKEN & SESSION ───────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('healthai_token');
}

function setSession(token, user) {
  localStorage.setItem('healthai_token', token);
  localStorage.setItem('healthai_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('healthai_token');
  localStorage.removeItem('healthai_user');
}

function getCurrentUser() {
  const raw = localStorage.getItem('healthai_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function requireLogin() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  clearSession();
  window.location.href = 'login.html';
}

// ── API HELPERS ───────────────────────────────────────────────────
async function apiFetch(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearSession();
    window.location.href = 'login.html';
    return null;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

const apiGet    = (path)       => apiFetch('GET',    path);
const apiPost   = (path, body) => apiFetch('POST',   path, body);
const apiPatch  = (path, body) => apiFetch('PATCH',  path, body);
const apiDelete = (path)       => apiFetch('DELETE', path);

// ── TOAST NOTIFICATIONS ───────────────────────────────────────────
function toast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  t.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(t);

  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

// ── LOADING SKELETON ──────────────────────────────────────────────
function skeletonCards(count = 3) {
  return Array(count).fill(`
    <div class="skeleton-card">
      <div class="skel skel-title"></div>
      <div class="skel skel-meta"></div>
      <div class="skel skel-meta" style="width:60%"></div>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <div class="skel skel-badge"></div>
        <div class="skel skel-badge"></div>
      </div>
    </div>`).join('');
}

// ── NAV BAR ───────────────────────────────────────────────────────
function renderNav(activePage) {
  const user = getCurrentUser();
  const role = user ? user.role : '';

  const links = [
    { href: 'dashboard.html',   label: 'Dashboard',    key: 'dashboard' },
    { href: 'post-feed.html',   label: 'Browse Posts', key: 'feed' },
    { href: 'create-post.html', label: '+ New Post',   key: 'create' },
    { href: 'profile.html',     label: 'Profile',      key: 'profile' },
  ];
  if (role === 'admin') {
    links.push({ href: 'admin.html', label: 'Admin', key: 'admin' });
  }

  const linksHtml = links.map(l =>
    `<a href="${l.href}" class="${activePage === l.key ? 'active' : ''}">${l.label}</a>`
  ).join('');

  const nav = document.createElement('nav');
  nav.className = 'topnav';
  nav.innerHTML = `
    <a href="dashboard.html" class="brand">
      <div class="logo">H</div>
      <div><div>HealthAI</div></div>
    </a>
    <div class="links">
      ${linksHtml}
      <span class="sep hide-mobile">|</span>
      <span class="user-name hide-mobile">${user ? user.name : ''}</span>
      <a href="#" class="logout" onclick="logout();return false;">Logout</a>
    </div>
  `;
  document.body.insertBefore(nav, document.body.firstChild);
}
