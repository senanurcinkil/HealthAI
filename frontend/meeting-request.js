requireLogin();
renderNav('feed');

const params = new URLSearchParams(window.location.search);
const postId = Number(params.get('post_id'));

const messageInput = document.getElementById('message');
const charCount    = document.getElementById('charCount');
const ndaSection   = document.getElementById('ndaSection');
const ndaCheck     = document.getElementById('ndaCheck');
const formError    = document.getElementById('formError');

function showErr(msg) { formError.textContent = msg; formError.classList.add('show'); }
function clearErr()   { formError.textContent = ''; formError.classList.remove('show'); }

const statusLabels = {
  active: 'Active', draft: 'Draft',
  meeting_scheduled: 'Meeting Scheduled',
  partner_found: 'Partner Found', expired: 'Expired',
};

// Pre-fill message from post-detail page
const savedMsg = sessionStorage.getItem('mr_message');
const savedNda = sessionStorage.getItem('mr_nda');
if (savedMsg && messageInput) messageInput.value = savedMsg;

async function loadPostInfo() {
  const postInfo = document.getElementById('postInfo');
  try {
    const post = await apiGet('/api/posts/' + postId);
    postInfo.innerHTML = `
      <div class="post-title" style="font-size:18px;font-weight:700;margin-bottom:8px;">${post.title}</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;font-size:13px;color:var(--muted);">
        <span>${post.domain}</span><span>·</span>
        <span>📍 ${post.city}, ${post.country}</span>
        <span class="badge badge-${post.status}">${statusLabels[post.status] || post.status}</span>
      </div>
      <hr class="divider" />
      <p style="font-size:14px;color:var(--mid);">${post.explanation}</p>`;

    if (post.confidentiality === 'meeting_only') {
      ndaSection.style.display = 'block';
      if (savedNda === 'true' && ndaCheck) ndaCheck.checked = true;
    }
  } catch (err) {
    postInfo.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Post not found.</p><a href="post-feed.html" class="btn btn-outline" style="margin-top:12px;">← Back</a></div>`;
  }
}

if (messageInput) {
  messageInput.addEventListener('input', () => {
    charCount.textContent = `${messageInput.value.length} / 300`;
  });
}

async function submitRequest() {
  clearErr();

  const message = messageInput ? messageInput.value.trim() : '';
  if (!message) { showErr('Please enter a message before submitting.'); return; }

  if (ndaSection && ndaSection.style.display !== 'none' && !ndaCheck.checked) {
    showErr('You must accept the NDA to continue.');
    return;
  }

  const slot1Date = document.getElementById('date1').value;
  const slot1Time = document.getElementById('time1').value;
  const slot2Date = document.getElementById('date2').value;
  const slot2Time = document.getElementById('time2').value;
  const slot3Date = document.getElementById('date3').value;
  const slot3Time = document.getElementById('time3').value;

  const proposedSlots = [];
  if (slot1Date && slot1Time) proposedSlots.push(`${slot1Date} ${slot1Time}`);
  if (slot2Date && slot2Time) proposedSlots.push(`${slot2Date} ${slot2Time}`);
  if (slot3Date && slot3Time) proposedSlots.push(`${slot3Date} ${slot3Time}`);

  if (proposedSlots.length === 0) { showErr('Please add at least one proposed time slot.'); return; }

  try {
    await apiPost('/api/posts/' + postId + '/meeting-requests', {
      message,
      nda_accepted: ndaCheck ? ndaCheck.checked : false,
      proposed_slots: proposedSlots,
    });

    sessionStorage.removeItem('mr_message');
    sessionStorage.removeItem('mr_nda');
    sessionStorage.removeItem('mr_post_id');

    window.location.href = 'dashboard.html';
  } catch (err) {
    showErr(err.message || 'Failed to send meeting request.');
  }
}

loadPostInfo();
