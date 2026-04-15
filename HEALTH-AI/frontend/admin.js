const role = sessionStorage.getItem("healthai_role");

if (role && role !== "admin") {
  alert("Access denied! Only admin can view this page.");
  window.location.href = "login.html";
}

let posts = [...MOCK_POSTS];
let users = [...MOCK_USERS];
let logs = [...MOCK_ACTIVITY_LOGS];

function showTab(tab) {
  document.getElementById("postsTab").style.display = "none";
  document.getElementById("usersTab").style.display = "none";
  document.getElementById("logsTab").style.display = "none";

  if (tab === "posts") document.getElementById("postsTab").style.display = "block";
  if (tab === "users") document.getElementById("usersTab").style.display = "block";
  if (tab === "logs") document.getElementById("logsTab").style.display = "block";
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

  table.innerHTML = `
    <tr>
      <th>Title</th>
      <th>Domain</th>
      <th>Status</th>
      <th>Created At</th>
      <th>Action</th>
    </tr>
  `;

  filteredPosts.forEach(post => {
    table.innerHTML += `
      <tr>
        <td>${post.title}</td>
        <td>${post.domain}</td>
        <td>${post.status}</td>
        <td>${post.created_at}</td>
        <td><button onclick="removePost(${post.id})">Remove</button></td>
      </tr>
    `;
  });
}

function loadUsers(filteredUsers = users) {
  const table = document.getElementById("usersTable");

  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Role</th>
      <th>Institution</th>
      <th>City</th>
      <th>Status</th>
      <th>Action</th>
    </tr>
  `;

  filteredUsers.forEach(user => {
    table.innerHTML += `
      <tr>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.institution}</td>
        <td>${user.city}</td>
        <td>${user.is_suspended ? "Suspended" : "Active"}</td>
        <td>
          <button onclick="suspendUser(${user.id})" ${user.is_suspended ? "disabled" : ""}>
            ${user.is_suspended ? "Suspended" : "Suspend Account"}
          </button>
        </td>
      </tr>
    `;
  });
}

function loadLogs(filteredLogs = logs) {
  const table = document.getElementById("logsTable");

  table.innerHTML = `
    <tr>
      <th>Timestamp</th>
      <th>User</th>
      <th>Action</th>
      <th>Target</th>
    </tr>
  `;

  filteredLogs.forEach(log => {
    table.innerHTML += `
      <tr>
        <td>${log.timestamp}</td>
        <td>${getUserNameById(log.user_id)}</td>
        <td>${log.action}</td>
        <td>${log.target_type} #${log.target_id}</td>
      </tr>
    `;
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