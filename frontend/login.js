if (getToken()) window.location.href = 'dashboard.html';

function isEduEmail(email) {
  return /^[^\s@]+@[^\s@]+\.(edu|edu\.\w{2,})$/i.test(email);
}

function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.classList.add('show');
}

async function doLogin() {
  const email    = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const btn      = document.querySelector('.btn-primary');

  document.getElementById('errorMsg').classList.remove('show');

  if (!email || !password) { showError('Please enter your email and password.'); return; }
  if (!isEduEmail(email))  { showError('Only institutional (.edu) email addresses are accepted.'); return; }

  btn.classList.add('btn-loading');
  try {
    const data = await apiPost('/api/auth/login', { email, password });
    setSession(data.access_token, data.user);
    window.location.href = 'dashboard.html';
  } catch (err) {
    showError(err.message || 'Login failed. Please try again.');
    btn.classList.remove('btn-loading');
  }
}

document.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
