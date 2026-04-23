requireLogin();
renderNav('feed');

const params  = new URLSearchParams(window.location.search);
const postId  = parseInt(params.get('id'));
const content = document.getElementById('content');
const userId  = getCurrentUser() ? getCurrentUser().id : -1;

const stageLabelMap = {
  idea: 'Idea', concept_validation: 'Concept Validation',
  prototype: 'Prototype Developed', pilot_testing: 'Pilot Testing',
  pre_deployment: 'Pre-Deployment',
};
const statusLabels = {
  active: 'Active', draft: 'Draft',
  meeting_scheduled: 'Meeting Scheduled',
  partner_found: 'Partner Found', expired: 'Expired',
};

async function loadPost() {
  content.innerHTML = `<div class="skeleton-card" style="margin-top:16px;">${skeletonCards(1)}</div>`;

  let post;
  try {
    post = await apiGet('/api/posts/' + postId);
  } catch {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Post not found.</p><a href="post-feed.html" class="btn btn-outline" style="margin-top:12px;">← Back to posts</a></div>`;
    return;
  }

  const isOwner = post.user_id === userId;

  let ownerBanner = '';
  if (isOwner && post.status === 'draft')
    ownerBanner = `<div class="alert alert-warning show" style="margin-bottom:16px;">This post is a <strong>Draft</strong> — not visible to other users.</div>`;
  if (isOwner && post.status === 'partner_found')
    ownerBanner = `<div class="alert alert-success show" style="margin-bottom:16px;">You marked this post as <strong>Partner Found</strong>. It is now closed.</div>`;

  let ownerActions = '';
  if (isOwner) {
    if (post.status === 'draft') {
      ownerActions = `<button class="btn btn-primary" onclick="publishPost()">Publish Post</button>
                      <button class="btn btn-danger"  onclick="deletePost()">Delete</button>`;
    } else if (post.status === 'active' || post.status === 'meeting_scheduled') {
      ownerActions = `<button class="btn btn-purple" onclick="markPartnerFound()">✓ Mark as Partner Found</button>
                      <button class="btn btn-danger" onclick="deletePost()">Delete</button>`;
    } else {
      ownerActions = `<button class="btn btn-danger" onclick="deletePost()">Delete</button>`;
    }
  }

  let visitorArea = '';
  if (!isOwner) {
    if (post.status === 'active') {
      const ndaBlock = post.confidentiality === 'meeting_only' ? `
        <div class="nda-box">
          <h3>⚠️ NDA Required</h3>
          <p style="font-size:13px;color:var(--mid);margin-bottom:10px;">
            This post has confidential content. By proceeding, you agree not to disclose any information shared.
          </p>
          <label><input type="checkbox" id="ndaCheck" /> I accept the Non-Disclosure Agreement (NDA) terms</label>
        </div>` : '';

      visitorArea = `
        <div class="card" style="margin-top:16px;">
          <h3 style="margin-bottom:12px;">Express Interest</h3>
          <div class="form-group">
            <label>Your Message</label>
            <textarea id="interestMsg" placeholder="Briefly describe your background and why you are interested…"></textarea>
          </div>
          ${ndaBlock}
          <button class="btn btn-primary" onclick="goToMeetingRequest(${post.id}, '${post.confidentiality}')">Send Meeting Request</button>
        </div>`;
    } else {
      visitorArea = `<div class="alert alert-warning show" style="margin-top:16px;">This post is not accepting new requests (status: ${statusLabels[post.status] || post.status}).</div>`;
    }
  }

  content.innerHTML = `
    <p style="margin-bottom:16px;"><a href="post-feed.html" style="color:var(--muted);font-size:13px;">← Back to posts</a></p>
    <div class="card">
      ${ownerBanner}
      <div class="detail-header">
        <div class="post-title" style="font-size:22px;font-weight:800;">${post.title}</div>
        <div style="font-size:13px;color:var(--muted);margin-top:6px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <span>${post.domain}</span><span>·</span>
          <span>📍 ${post.city}, ${post.country}</span><span>·</span>
          <span>Posted by <strong>${post.author_name}</strong></span><span>·</span>
          <span>${post.created_at}</span>
          <span class="badge badge-${post.status}">${statusLabels[post.status] || post.status}</span>
        </div>
      </div>
      <hr class="divider" />
      <div class="detail-grid">
        <div>
          <div class="detail-field"><div class="lbl">Description</div><div class="val">${post.explanation}</div></div>
          <div class="detail-field" style="margin-top:16px;"><div class="lbl">Expertise Needed</div><div class="val">${post.expertise_needed}</div></div>
        </div>
        <div>
          <div class="detail-field"><div class="lbl">Project Stage</div><div class="val">${stageLabelMap[post.stage] || post.stage}</div></div>
          <div class="detail-field" style="margin-top:16px;"><div class="lbl">Confidentiality</div>
            <div class="val">${post.confidentiality === 'meeting_only' ? '🔒 Details discussed in meeting only' : '🌐 Public pitch'}</div>
          </div>
          <div class="detail-field" style="margin-top:16px;"><div class="lbl">Expiry Date</div><div class="val">${post.expiry_date || '—'}</div></div>
        </div>
      </div>
      ${isOwner ? `<div class="action-bar">${ownerActions}</div>` : ''}
    </div>
    ${visitorArea}`;
}

function goToMeetingRequest(pid, confidentiality) {
  const msg = (document.getElementById('interestMsg') || {}).value || '';
  if (!msg.trim()) { toast('Please write a message before submitting.', 'warning'); return; }

  const ndaCheck = document.getElementById('ndaCheck');
  if (ndaCheck && !ndaCheck.checked) { toast('You must accept the NDA to proceed.', 'warning'); return; }

  sessionStorage.setItem('mr_post_id', pid);
  sessionStorage.setItem('mr_message', msg.trim());
  sessionStorage.setItem('mr_nda', ndaCheck ? ndaCheck.checked : false);
  window.location.href = 'meeting-request.html?post_id=' + pid;
}

async function publishPost() {
  try {
    await apiPatch('/api/posts/' + postId, { status: 'active' });
    toast('Post published successfully!', 'success');
    loadPost();
  } catch (err) { toast(err.message, 'error'); }
}

async function deletePost() {
  if (!confirm('Are you sure you want to delete this post?')) return;
  try {
    await apiDelete('/api/posts/' + postId);
    toast('Post deleted.', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
  } catch (err) { toast(err.message, 'error'); }
}

async function markPartnerFound() {
  if (!confirm('Mark this post as "Partner Found"? It will be closed to new requests.')) return;
  try {
    await apiPatch('/api/posts/' + postId, { status: 'partner_found' });
    toast('Marked as Partner Found!', 'success');
    loadPost();
  } catch (err) { toast(err.message, 'error'); }
}

loadPost();
