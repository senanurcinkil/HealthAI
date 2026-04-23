requireLogin();
const _user = getCurrentUser();
if (!_user || _user.role !== 'admin') {
  toast('Access denied! Admin only.', 'error');
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
}

function showTab(tab, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tab + 'Panel').classList.add('active');
  if (btn) btn.classList.add('active');
}

// ── POSTS ──────────────────────────────────────────────────────────
async function loadPosts() {
  const domain = document.getElementById('postDomainFilter').value.trim();
  const status = document.getElementById('postStatusFilter').value;
  let path = '/api/admin/posts';
  const q = new URLSearchParams();
  if (domain) q.set('domain', domain);
  if (status) q.set('status', status);
  if ([...q].length) path += '?' + q.toString();

  try {
    const posts = await apiGet(path);
    const table = document.getElementById('postsTable');
    table.innerHTML = `<thead><tr><th>Title</th><th>Domain</th><th>Status</th><th>Created</th><th>Action</th></tr></thead><tbody></tbody>`;
    const tbody = table.querySelector('tbody');
    posts.forEach(post => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${post.title}</td>
        <td>${post.domain}</td>
        <td><span class="badge badge-${post.status}">${post.status}</span></td>
        <td>${post.created_at}</td>
        <td><button class="btn btn-danger btn-sm" onclick="removePost(${post.id})">Remove</button></td>`;
      tbody.appendChild(tr);
    });
  } catch (err) { toast('Failed to load posts.', 'error'); }
}

async function removePost(id) {
  if (!confirm('Are you sure you want to remove this post?')) return;
  try {
    await apiDelete('/api/admin/posts/' + id);
    toast('Post removed.', 'success');
    loadPosts();
    loadLogs();
  } catch (err) { toast(err.message, 'error'); }
}

function filterPosts()      { loadPosts(); }
function resetPostFilters() {
  document.getElementById('postDomainFilter').value = '';
  document.getElementById('postStatusFilter').value = '';
  loadPosts();
}

// ── USERS ──────────────────────────────────────────────────────────
async function loadUsers() {
  const role = document.getElementById('userRoleFilter').value;
  let path = '/api/admin/users';
  if (role) path += '?role=' + role;

  try {
    const users = await apiGet(path);
    const table = document.getElementById('usersTable');
    table.innerHTML = `<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Institution</th><th>City</th><th>Status</th><th>Action</th></tr></thead><tbody></tbody>`;
    const tbody = table.querySelector('tbody');
    users.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.name}</td>
        <td style="font-size:12px;color:var(--muted);">${user.email}</td>
        <td><span class="tag">${user.role}</span></td>
        <td>${user.institution}</td>
        <td>${user.city}</td>
        <td>${user.is_suspended
          ? '<span class="badge" style="background:#fee2e2;color:#b91c1c;">Suspended</span>'
          : '<span class="badge" style="background:#dcfce7;color:#15803d;">Active</span>'}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="suspendUser(${user.id})" ${user.is_suspended ? 'disabled' : ''}>
            ${user.is_suspended ? 'Suspended' : 'Suspend'}
          </button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) { toast('Failed to load users.', 'error'); }
}

async function suspendUser(id) {
  if (!confirm('Suspend this user?')) return;
  try {
    await apiPatch('/api/admin/users/' + id + '/suspend');
    toast('User suspended.', 'success');
    loadUsers();
    loadLogs();
  } catch (err) { toast(err.message, 'error'); }
}

function filterUsers()      { loadUsers(); }
function resetUserFilters() { document.getElementById('userRoleFilter').value = ''; loadUsers(); }

// ── LOGS ───────────────────────────────────────────────────────────
async function loadLogs() {
  const userId = document.getElementById('logUserFilter').value;
  const date   = document.getElementById('logDateFilter').value;
  let path = '/api/admin/logs';
  const q = new URLSearchParams();
  if (userId) q.set('user_id', userId);
  if (date)   q.set('date', date);
  if ([...q].length) path += '?' + q.toString();

  try {
    const logs = await apiGet(path);
    const table = document.getElementById('logsTable');
    table.innerHTML = `<thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Target</th></tr></thead><tbody></tbody>`;
    const tbody = table.querySelector('tbody');
    logs.forEach(log => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family:monospace;font-size:12px;">${log.timestamp}</td>
        <td>${log.user_name}</td>
        <td><span class="tag" style="font-family:monospace;">${log.action}</span></td>
        <td style="color:var(--muted);font-size:12px;">${log.target_type} #${log.target_id}</td>`;
      tbody.appendChild(tr);
    });
  } catch (err) { toast('Failed to load logs.', 'error'); }
}

function filterLogs()      { loadLogs(); }
function resetLogFilters() {
  document.getElementById('logUserFilter').value = '';
  document.getElementById('logDateFilter').value = '';
  loadLogs();
}

async function exportCSV() {
  try {
    const logs = await apiGet('/api/admin/logs');
    let csv = 'Timestamp,User,Action,Target\n';
    logs.forEach(log => {
      csv += [log.timestamp, log.user_name, log.action, `${log.target_type} #${log.target_id}`]
        .map(v => `"${v}"`).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'activity_logs.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast('Logs exported.', 'success');
  } catch (err) { toast(err.message, 'error'); }
}

// ── INIT ───────────────────────────────────────────────────────────
loadPosts();
loadUsers();
loadLogs();
