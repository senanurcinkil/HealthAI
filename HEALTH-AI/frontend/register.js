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
  document.getElementById('formSuccess').style.display = 'none';
}

function doRegister() {
  const fullName       = document.getElementById('fullName').value.trim();
  const email          = document.getElementById('email').value.trim().toLowerCase();
  const password       = document.getElementById('password').value;
  const confirmPwd     = document.getElementById('confirmPassword').value;
  const role           = document.getElementById('role').value;
  const institution    = document.getElementById('institution').value.trim();
  const city           = document.getElementById('city').value.trim();
  const expertise      = document.getElementById('expertise').value.trim();

  document.getElementById('formError').classList.remove('show');
  document.getElementById('formSuccess').classList.remove('show');

  if (!fullName)                   return showError('Full name is required.');
  if (!email)                      return showError('Email is required.');
  if (!isValidEduEmail(email))     return showError('Only institutional (.edu) email addresses are accepted. Personal email providers (Gmail, Hotmail, etc.) are not permitted.');
  if (!isStrongPassword(password)) return showError('Password must be at least 8 characters and include at least one uppercase letter and one number.');
  if (password !== confirmPwd)     return showError('Passwords do not match.');
  if (!role)                       return showError('Please select a role (Engineer or Healthcare Professional).');

  // Check duplicate email
  if (MOCK_USERS.find(u => u.email.toLowerCase() === email)) {
    return showError('An account with this email already exists. Please login.');
  }

  // Add new user to mock data (in-memory)
  const newUser = {
    id: MOCK_USERS.length + 1,
    name: fullName,
    email: email,
    role: role,
    institution: institution || '',
    expertise: expertise || '',
    city: city || '',
    is_suspended: false,
  };
  MOCK_USERS.push(newUser);

  // Start session
  sessionStorage.setItem('healthai_user_id',  String(newUser.id));
  sessionStorage.setItem('healthai_role',      newUser.role);
  sessionStorage.setItem('healthai_user_name', newUser.name);

  // Log registration
  const logs = JSON.parse(sessionStorage.getItem('healthai_logs') || '[]');
  logs.push({
    id: Date.now(),
    user_id: newUser.id,
    action: 'USER_REGISTERED',
    target_type: 'user',
    target_id: newUser.id,
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
  });
  sessionStorage.setItem('healthai_logs', JSON.stringify(logs));

  const successEl = document.getElementById('formSuccess');
  successEl.textContent = 'Account created! A verification email has been sent to ' + email + '. Redirecting to dashboard…';
  successEl.classList.add('show');

  setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);
}
