function isValidEduEmail(email) {
  return /^[^\s@]+@[^\s@]+\.(edu|edu\.\w{2,})$/i.test(email);
}

function isStrongPassword(pwd) {
  return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);
}

function showError(msg) {
  const el = document.getElementById('formError');
  el.textContent = msg;
  el.classList.add('show');
  document.getElementById('formSuccess').classList.remove('show');
}

async function doRegister() {
  const fullName    = document.getElementById('fullName').value.trim();
  const email       = document.getElementById('email').value.trim().toLowerCase();
  const password    = document.getElementById('password').value;
  const confirmPwd  = document.getElementById('confirmPassword').value;
  const role        = document.getElementById('role').value;
  const institution = document.getElementById('institution').value.trim();
  const city        = document.getElementById('city').value.trim();
  const expertise   = document.getElementById('expertise').value.trim();
  const btn         = document.querySelector('.btn-primary');

  document.getElementById('formError').classList.remove('show');
  document.getElementById('formSuccess').classList.remove('show');

  if (!fullName)                   return showError('Full name is required.');
  if (!email)                      return showError('Email is required.');
  if (!isValidEduEmail(email))     return showError('Only institutional (.edu) email addresses are accepted.');
  if (!isStrongPassword(password)) return showError('Password must be at least 8 characters and include one uppercase letter and one number.');
  if (password !== confirmPwd)     return showError('Passwords do not match.');
  if (!role)                       return showError('Please select a role.');

  btn.classList.add('btn-loading');
  try {
    const data = await apiPost('/api/auth/register', {
      name: fullName, email, password, role, institution, expertise, city,
    });
    setSession(data.access_token, data.user);
    document.getElementById('formSuccess').textContent = 'Account created! Redirecting…';
    document.getElementById('formSuccess').classList.add('show');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
  } catch (err) {
    showError(err.message || 'Registration failed. Please try again.');
    btn.classList.remove('btn-loading');
  }
}
