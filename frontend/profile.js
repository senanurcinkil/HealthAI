// Require login
if (!sessionStorage.getItem('healthai_user_id')) {
  window.location.href = 'login.html';
}

// Load current user from MOCK_USERS based on session id
const userId = parseInt(sessionStorage.getItem('healthai_user_id'));
let currentUser = MOCK_USERS.find(u => u.id === userId) || null;

if (!currentUser) {
  window.location.href = 'login.html';
}

function loadProfile() {
  document.getElementById('fullName').value    = currentUser.name        || '';
  document.getElementById('email').value       = currentUser.email       || '';
  document.getElementById('institution').value = currentUser.institution || '';
  document.getElementById('expertise').value   = currentUser.expertise   || '';
  document.getElementById('city').value        = currentUser.city        || '';
  document.getElementById('role').value        = currentUser.role        || '';
}

function enableEdit() {
  ['fullName', 'institution', 'expertise', 'city'].forEach(id => {
    document.getElementById(id).disabled = false;
  });
}

function saveProfile() {
  currentUser.name        = document.getElementById('fullName').value.trim();
  currentUser.institution = document.getElementById('institution').value.trim();
  currentUser.expertise   = document.getElementById('expertise').value.trim();
  currentUser.city        = document.getElementById('city').value.trim();

  ['fullName', 'institution', 'expertise', 'city'].forEach(id => {
    document.getElementById(id).disabled = true;
  });

  alert('Profile updated successfully.');
}

function downloadMyData() {
  const exportData = {
    profile: currentUser,
    exported_at: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'my_healthai_data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function deleteMyAccount() {
  const confirmed = confirm(
    'Are you sure you want to delete your account?\n\nAll your personal data will be removed. This action cannot be undone.'
  );
  if (!confirmed) return;

  sessionStorage.clear();
  alert('Your account and personal data have been deleted (GDPR Right to Erasure).');
  window.location.href = 'login.html';
}

loadProfile();
