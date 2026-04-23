// ── SESSION HELPERS ───────────────────────────────────────────────

function getCurrentUser() {
  const id = parseInt(sessionStorage.getItem('healthai_user_id'));
  if (!id) return null;
  return MOCK_USERS.find(u => u.id === id) || null;
}

function requireLogin() {
  if (!sessionStorage.getItem('healthai_user_id')) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// ── POST STATE (sessionStorage so changes persist across pages) ───

function getSessionPosts() {
  const stored = sessionStorage.getItem('healthai_posts');
  if (stored) return JSON.parse(stored);
  const initial = MOCK_POSTS.map(p => Object.assign({}, p));
  sessionStorage.setItem('healthai_posts', JSON.stringify(initial));
  return initial;
}

function saveSessionPosts(posts) {
  sessionStorage.setItem('healthai_posts', JSON.stringify(posts));
}

// ── ACTIVITY LOG ──────────────────────────────────────────────────

function addLog(action, targetType, targetId) {
  const user = getCurrentUser();
  if (!user) return;
  const logs = JSON.parse(sessionStorage.getItem('healthai_logs') || '[]');
  logs.push({
    id: Date.now(),
    user_id: user.id,
    action: action,
    target_type: targetType,
    target_id: targetId,
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
  });
  sessionStorage.setItem('healthai_logs', JSON.stringify(logs));
}

function getAllLogs() {
  const session = JSON.parse(sessionStorage.getItem('healthai_logs') || '[]');
  const sessionIds = new Set(session.map(l => l.id));
  const merged = [...MOCK_ACTIVITY_LOGS.filter(l => !sessionIds.has(l.id)), ...session];
  merged.sort((a, b) => a.timestamp > b.timestamp ? 1 : -1);
  return merged;
}

// ── NAV BAR ───────────────────────────────────────────────────────

function renderNav(activePage) {
  const user = getCurrentUser();
  const role = sessionStorage.getItem('healthai_role');

  const links = [
    { href: 'dashboard.html',   label: 'Dashboard',     key: 'dashboard' },
    { href: 'post-feed.html',   label: 'Browse Posts',  key: 'feed' },
    { href: 'create-post.html', label: '+ New Post',    key: 'create' },
    { href: 'profile.html',     label: 'Profile',       key: 'profile' },
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
      <div>
        <div>HealthAI</div>
      </div>
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
