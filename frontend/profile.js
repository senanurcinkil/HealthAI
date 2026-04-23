requireLogin();

async function init() {
  let user;
  try {
    user = await apiGet('/api/users/me');
    setSession(getToken(), user);
  } catch {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('fullName').value    = user.name        || '';
  document.getElementById('email').value       = user.email       || '';
  document.getElementById('institution').value = user.institution || '';
  document.getElementById('expertise').value   = user.expertise   || '';
  document.getElementById('city').value        = user.city        || '';
  document.getElementById('role').value        = user.role        || '';
}

function enableEdit() {
  ['fullName', 'institution', 'expertise', 'city'].forEach(id => {
    document.getElementById(id).disabled = false;
  });
}

async function saveProfile() {
  const btn = document.querySelector('.btn-success') || document.querySelector('.btn-primary');
  if (btn) btn.classList.add('btn-loading');
  try {
    const updated = await apiPatch('/api/users/me', {
      name:        document.getElementById('fullName').value.trim(),
      institution: document.getElementById('institution').value.trim(),
      expertise:   document.getElementById('expertise').value.trim(),
      city:        document.getElementById('city').value.trim(),
    });
    setSession(getToken(), updated);
    ['fullName', 'institution', 'expertise', 'city'].forEach(id => {
      document.getElementById(id).disabled = true;
    });
    toast('Profile updated successfully.', 'success');
  } catch (err) {
    toast(err.message || 'Failed to update profile.', 'error');
  } finally {
    if (btn) btn.classList.remove('btn-loading');
  }
}

async function downloadMyData() {
  try {
    const data = await apiGet('/api/users/me/export');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my_healthai_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast('Data exported successfully.', 'success');
  } catch (err) {
    toast(err.message || 'Export failed.', 'error');
  }
}

async function deleteMyAccount() {
  if (!confirm('Are you sure you want to delete your account?\n\nThis action cannot be undone.')) return;
  try {
    await apiDelete('/api/users/me');
    clearSession();
    toast('Account deleted.', 'info');
    setTimeout(() => { window.location.href = 'login.html'; }, 800);
  } catch (err) {
    toast(err.message || 'Failed to delete account.', 'error');
  }
}

init();
