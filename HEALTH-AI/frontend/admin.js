const role = sessionStorage.getItem("healthai_role");

if (!sessionStorage.getItem("healthai_user_id")) {
  window.location.href = "login.html";
} else if (role !== "admin") {
  alert("Access denied! Only admin can view this page.");
  window.location.href = "dashboard.html";
}

// Use session posts if available (includes newly created posts)
const _sp = sessionStorage.getItem('healthai_posts');
let posts = _sp ? JSON.parse(_sp) : [...MOCK_POSTS];
let users = [...MOCK_USERS];

// Merge mock logs with session logs
const _sl = JSON.parse(sessionStorage.getItem('healthai_logs') || '[]');
const _slIds = new Set(_sl.map(l => l.id));
let logs = [...MOCK_ACTIVITY_LOGS.filter(l => !_slIds.has(l.id)), ..._sl]
  .sort((a, b) => a.timestamp > b.timestamp ? 1 : -1);

function showTab(tab, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tab + 'Panel').classList.add('active');
  if (btn) btn.classList.add('active');
}

function getUserNameById(userId) {
  const user = users.find(u => u.id === userId);
  return user ? user.name : `User #${userId}`;
}

function fillLogUserFilter() {
  const select = document.getElementById("logUserFilter");
  select.innerHTML = `<option value="">All Users</option>`;

  users.forEach(user => {
    select.innerHTML += `<option value="${user.id}">${user.name}</option>`;
  });
}

function loadPosts(filteredPosts = posts) {
  const table = document.getElementById("postsTable");
  table.innerHTML = `<thead><tr><th>Title</th><th>Domain</th><th>Status</th><th>Created</th><th>Action</th></tr></thead><tbody></tbody>`;
  const tbody = table.querySelector('tbody');
  filteredPosts.forEach(post => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${post.title}</td>
      <td>${post.domain}</td>
      <td><span class="badge badge-${post.status}">${post.status}</span></td>
      <td>${post.created_at}</td>
      <td><button class="btn btn-danger btn-sm" onclick="removePost(${post.id})">Remove</button></td>`;
    tbody.appendChild(tr);
  });
}

function loadUsers(filteredUsers = users) {
  const table = document.getElementById("usersTable");
  table.innerHTML = `<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Institution</th><th>City</th><th>Status</th><th>Action</th></tr></thead><tbody></tbody>`;
  const tbody = table.querySelector('tbody');
  filteredUsers.forEach(user => {
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
        <button class="btn btn-danger btn-sm" onclick="suspendUser(${user.id})" ${user.is_suspended ? "disabled" : ""}>
          ${user.is_suspended ? "Suspended" : "Suspend"}
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function loadLogs(filteredLogs = logs) {
  const table = document.getElementById("logsTable");
  table.innerHTML = `<thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Target</th></tr></thead><tbody></tbody>`;
  const tbody = table.querySelector('tbody');
  filteredLogs.forEach(log => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family:monospace;font-size:12px;">${log.timestamp}</td>
      <td>${getUserNameById(log.user_id)}</td>
      <td><span class="tag" style="font-family:monospace;">${log.action}</span></td>
      <td style="color:var(--muted);font-size:12px;">${log.target_type} #${log.target_id}</td>`;
    tbody.appendChild(tr);
  });
}

function removePost(id) {
  const confirmed = confirm("Are you sure you want to remove this post?");
  if (!confirmed) return;

  posts = posts.filter(post => post.id !== id);

  logs.push({
    id: logs.length + 1,
    user_id: 5,
    action: "POST_REMOVED",
    target_type: "post",
    target_id: id,
    timestamp: new Date().toISOString().slice(0, 16).replace("T", " ")
  });

  loadPosts();
  loadLogs();
}

function suspendUser(id) {
  const user = users.find(u => u.id === id);
  if (!user) return;

  const confirmed = confirm(`Suspend account for ${user.name}?`);
  if (!confirmed) return;

  user.is_suspended = true;

  logs.push({
    id: logs.length + 1,
    user_id: 5,
    action: "USER_SUSPENDED",
    target_type: "user",
    target_id: id,
    timestamp: new Date().toISOString().slice(0, 16).replace("T", " ")
  });

  loadUsers();
  loadLogs();
}

function filterPosts() {
  const domainValue = document.getElementById("postDomainFilter").value.trim().toLowerCase();
  const statusValue = document.getElementById("postStatusFilter").value;
  const dateValue = document.getElementById("postDateFilter").value;

  const filtered = posts.filter(post => {
    const matchDomain = !domainValue || post.domain.toLowerCase().includes(domainValue);
    const matchStatus = !statusValue || post.status === statusValue;
    const matchDate = !dateValue || post.created_at === dateValue;
    return matchDomain && matchStatus && matchDate;
  });

  loadPosts(filtered);
}

function resetPostFilters() {
  document.getElementById("postDomainFilter").value = "";
  document.getElementById("postStatusFilter").value = "";
  document.getElementById("postDateFilter").value = "";
  loadPosts();
}

function filterUsers() {
  const roleValue = document.getElementById("userRoleFilter").value;

  const filtered = users.filter(user => {
    return !roleValue || user.role === roleValue;
  });

  loadUsers(filtered);
}

function resetUserFilters() {
  document.getElementById("userRoleFilter").value = "";
  loadUsers();
}

function filterLogs() {
  const userValue = document.getElementById("logUserFilter").value;
  const dateValue = document.getElementById("logDateFilter").value;

  const filtered = logs.filter(log => {
    const matchUser = !userValue || String(log.user_id) === userValue;
    const matchDate = !dateValue || log.timestamp.startsWith(dateValue);
    return matchUser && matchDate;
  });

  loadLogs(filtered);
}

function resetLogFilters() {
  document.getElementById("logUserFilter").value = "";
  document.getElementById("logDateFilter").value = "";
  loadLogs();
}

function exportCSV() {
  let csv = "Timestamp,User,Action,Target\n";

  logs.forEach(log => {
    const row = [
      log.timestamp,
      getUserNameById(log.user_id),
      log.action,
      `${log.target_type} #${log.target_id}`
    ];
    csv += row.map(value => `"${value}"`).join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "activity_logs.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

fillLogUserFilter();
loadPosts();
loadUsers();
loadLogs();