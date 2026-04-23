// Redirect if already logged in
if (sessionStorage.getItem('healthai_user_id')) {
  window.location.href = 'dashboard.html';
}

const MOCK_PASSWORDS = {
  'ali@metu.edu.tr':         'pass123',
  'selin@hacettepe.edu.tr':  'pass123',
  'm.oz@istanbul.edu.tr':    'pass123',
  'a.demir@ege.edu.tr':      'pass123',
  'admin@healthai.edu':      'pass123',
};

function isEduEmail(email) {
  return /^[^\s@]+@[^\s@]+\.(edu|edu\.\w{2,})$/i.test(email);
}

function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.classList.add('show');
}

function doLogin() {
  const email    = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  document.getElementById('errorMsg').classList.remove('show');

  if (!email || !password) {
    showError('Please enter your email and password.');
    return;
  }

  if (!isEduEmail(email)) {
    showError('Only institutional (.edu) email addresses are accepted.');
    return;
  }

  const user = MOCK_USERS.find(u => u.email.toLowerCase() === email);

  if (!user || MOCK_PASSWORDS[email] !== password) {
    showError('Invalid email or password.');
    return;
  }

  if (user.is_suspended) {
    showError('Your account has been suspended. Please contact the administrator.');
    return;
  }

  // Save session
  sessionStorage.setItem('healthai_user_id',   String(user.id));
  sessionStorage.setItem('healthai_role',       user.role);
  sessionStorage.setItem('healthai_user_name',  user.name);

  // Log the login action
  const logs = JSON.parse(sessionStorage.getItem('healthai_logs') || '[]');
  logs.push({
    id: Date.now(),
    user_id: user.id,
    action: 'USER_LOGIN',
    target_type: 'user',
    target_id: user.id,
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
  });
  sessionStorage.setItem('healthai_logs', JSON.stringify(logs));

  window.location.href = 'dashboard.html';
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') doLogin();
});
