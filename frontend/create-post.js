requireLogin();
renderNav('create');

const currentUser = getCurrentUser();
if (currentUser && currentUser.city) {
  document.getElementById('city').value = currentUser.city;
}

const defaultExpiry = new Date();
defaultExpiry.setMonth(defaultExpiry.getMonth() + 3);
document.getElementById('expiryDate').value = defaultExpiry.toISOString().slice(0, 10);

function _showErr(msg) {
  const el = document.getElementById('formError');
  el.textContent = msg;
  el.classList.add('show');
  document.getElementById('formSuccess').classList.remove('show');
}

async function submitPost(statusValue) {
  const title           = document.getElementById('title').value.trim();
  const domain          = document.getElementById('domain').value;
  const explanation     = document.getElementById('explanation').value.trim();
  const expertiseNeeded = document.getElementById('expertiseNeeded').value.trim();
  const stage           = document.getElementById('stage').value;
  const confidentiality = document.getElementById('confidentiality').value;
  const city            = document.getElementById('city').value.trim();
  const country         = document.getElementById('country').value.trim();
  const expiryDate      = document.getElementById('expiryDate').value;
  const autoClose       = document.getElementById('autoClose').value === 'true';
  const btn             = document.querySelector('.btn-primary');

  document.getElementById('formError').classList.remove('show');
  document.getElementById('formSuccess').classList.remove('show');

  if (!title)           return _showErr('Title is required.');
  if (!domain)          return _showErr('Please select a working domain.');
  if (!explanation)     return _showErr('Short explanation is required.');
  if (explanation.length > 500) return _showErr('Explanation must be 500 characters or fewer.');
  if (!expertiseNeeded) return _showErr('Please specify the expertise needed.');
  if (!stage)           return _showErr('Please select the project stage.');
  if (!city)            return _showErr('City is required.');
  if (!country)         return _showErr('Country is required.');

  btn.classList.add('btn-loading');
  try {
    await apiPost('/api/posts', {
      title, domain, explanation,
      expertise_needed: expertiseNeeded,
      stage, confidentiality,
      expiry_date: expiryDate,
      city, country,
      auto_close: autoClose,
      status: statusValue,
    });

    const msg = statusValue === 'active' ? 'Post published successfully!' : 'Draft saved.';
    toast(msg, 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
  } catch (err) {
    _showErr(err.message || 'Failed to create post.');
    btn.classList.remove('btn-loading');
  }
}
