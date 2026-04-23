renderNav('create');

// Pre-fill city from user profile
const currentUser = getCurrentUser();
if (currentUser && currentUser.city) {
  document.getElementById('city').value = currentUser.city;
}

// Set default expiry to 3 months from today
const defaultExpiry = new Date();
defaultExpiry.setMonth(defaultExpiry.getMonth() + 3);
document.getElementById('expiryDate').value = defaultExpiry.toISOString().slice(0, 10);

function _showErr(msg) {
  const el = document.getElementById('formError');
  el.textContent = msg;
  el.classList.add('show');
  document.getElementById('formSuccess').classList.remove('show');
}

function submitPost(statusValue) {
  const title          = document.getElementById('title').value.trim();
  const domain         = document.getElementById('domain').value;
  const explanation    = document.getElementById('explanation').value.trim();
  const expertiseNeeded = document.getElementById('expertiseNeeded').value.trim();
  const stage          = document.getElementById('stage').value;
  const confidentiality = document.getElementById('confidentiality').value;
  const city           = document.getElementById('city').value.trim();
  const country        = document.getElementById('country').value.trim();
  const expiryDate     = document.getElementById('expiryDate').value;
  const autoClose      = document.getElementById('autoClose').value === 'true';

  document.getElementById('formError').classList.remove('show');
  document.getElementById('formSuccess').classList.remove('show');

  if (!title)           return _showErr('Title is required.');
  if (!domain)          return _showErr('Please select a working domain.');
  if (!explanation)     return _showErr('Short explanation is required.');
  if (explanation.length > 500) return showError('Explanation must be 500 characters or fewer.');
  if (!expertiseNeeded) return showError('Please specify the expertise needed.');
  if (!stage)           return _showErr('Please select the project stage.');
  if (!city)            return _showErr('City is required.');
  if (!country)         return _showErr('Country is required.');

  const userId = parseInt(sessionStorage.getItem('healthai_user_id'));
  const posts  = getSessionPosts();

  const newPost = {
    id:              Date.now(),
    user_id:         userId,
    title:           title,
    domain:          domain,
    role_type:       currentUser ? currentUser.role : 'engineer',
    stage:           stage,
    status:          statusValue,
    explanation:     explanation,
    expertise_needed: expertiseNeeded,
    confidentiality: confidentiality,
    expiry_date:     expiryDate,
    city:            city,
    country:         country,
    auto_close:      autoClose,
    created_at:      new Date().toISOString().slice(0, 10),
  };

  posts.push(newPost);
  saveSessionPosts(posts);
  addLog('POST_CREATED', 'post', newPost.id);

  const successEl = document.getElementById('formSuccess');
  successEl.textContent = statusValue === 'active'
    ? 'Post published successfully! Redirecting to your dashboard…'
    : 'Draft saved. Redirecting to your dashboard…';
  successEl.classList.add('show');

  setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
}
