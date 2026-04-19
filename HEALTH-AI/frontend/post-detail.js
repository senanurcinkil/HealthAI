renderNav('feed');

const params  = new URLSearchParams(window.location.search);
const postId  = parseInt(params.get('id'));
const posts   = getSessionPosts();
const post    = posts.find(p => p.id === postId);
const content = document.getElementById('content');
const userId  = parseInt(sessionStorage.getItem('healthai_user_id'));

if (!post) {
  content.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <p>Post not found.</p>
      <a href="post-feed.html" class="btn btn-outline" style="margin-top:12px;">← Back to posts</a>
    </div>`;
  throw new Error('Post not found');
}

const author  = MOCK_USERS.find(u => u.id === post.user_id);
const isOwner = post.user_id === userId;

const stageLabelMap = {
  idea: 'Idea', concept_validation: 'Concept Validation',
  prototype: 'Prototype Developed', pilot_testing: 'Pilot Testing',
  pre_deployment: 'Pre-Deployment'
};
const statusLabels = {
  active: 'Active', draft: 'Draft',
  meeting_scheduled: 'Meeting Scheduled',
  partner_found: 'Partner Found', expired: 'Expired'
};

function renderPost() {
  const p = getSessionPosts().find(p => p.id === postId);

  let ownerBanner = '';
  if (isOwner && p.status === 'draft') {
    ownerBanner = `<div class="alert alert-warning show" style="margin-bottom:16px;">This post is a <strong>Draft</strong> — not visible to other users.</div>`;
  }
  if (isOwner && p.status === 'partner_found') {
    ownerBanner = `<div class="alert alert-success show" style="margin-bottom:16px;">You marked this post as <strong>Partner Found</strong>. It is now closed.</div>`;
  }

  let ownerActions = '';
  if (isOwner) {
    if (p.status === 'draft') {
      ownerActions = `<button class="btn btn-primary" onclick="publishPost()">Publish Post</button>
                      <button class="btn btn-danger"  onclick="deletePost()">Delete</button>`;
    } else if (p.status === 'active' || p.status === 'meeting_scheduled') {
      ownerActions = `<button class="btn btn-purple" onclick="markPartnerFound()">✓ Mark as Partner Found</button>
                      <button class="btn btn-danger" onclick="deletePost()">Delete</button>`;
    } else {
      ownerActions = `<button class="btn btn-danger" onclick="deletePost()">Delete</button>`;
    }
  }

  let visitorArea = '';
  if (!isOwner) {
    if (p.status === 'active') {
      const ndaBlock = p.confidentiality === 'meeting_only' ? `
        <div class="nda-box">
          <h3>⚠️ NDA Required</h3>
          <p style="font-size:13px;color:var(--mid);margin-bottom:10px;">
            This post has confidential content. By proceeding, you agree not to disclose any information shared during this collaboration.
          </p>
          <label>
            <input type="checkbox" id="ndaCheck" />
            I accept the Non-Disclosure Agreement (NDA) terms
          </label>
        </div>` : '';

      visitorArea = `
        <div class="card" style="margin-top:16px;">
          <h3 style="margin-bottom:12px;">Express Interest</h3>
          <div class="form-group">
            <label>Your Message</label>
            <textarea id="interestMsg" placeholder="Briefly describe your background and why you are interested in this collaboration…"></textarea>
          </div>
          ${ndaBlock}
          <button class="btn btn-primary" onclick="requestMeeting()">Send Meeting Request</button>
        </div>`;
    } else {
      visitorArea = `<div class="alert alert-warning show" style="margin-top:16px;">This post is not accepting new requests (status: ${statusLabels[p.status] || p.status}).</div>`;
    }
  }

  content.innerHTML = `
    <p style="margin-bottom:16px;"><a href="post-feed.html" style="color:var(--muted);font-size:13px;">← Back to posts</a></p>

    <div class="card">
      ${ownerBanner}
      <div class="detail-header">
        <div class="post-title" style="font-size:22px;font-weight:800;">${p.title}</div>
        <div style="font-size:13px;color:var(--muted);margin-top:6px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <span>${p.domain}</span>
          <span>·</span>
          <span>📍 ${p.city}, ${p.country}</span>
          <span>·</span>
          <span>Posted by <strong>${author ? author.name : 'Unknown'}</strong></span>
          <span>·</span>
          <span>${p.created_at}</span>
          <span class="badge badge-${p.status}">${statusLabels[p.status] || p.status}</span>
        </div>
      </div>

      <hr class="divider" />

      <div class="detail-grid">
        <div>
          <div class="detail-field">
            <div class="lbl">Description</div>
            <div class="val">${p.explanation}</div>
          </div>
          <div class="detail-field" style="margin-top:16px;">
            <div class="lbl">Expertise Needed</div>
            <div class="val">${p.expertise_needed}</div>
          </div>
        </div>
        <div>
          <div class="detail-field">
            <div class="lbl">Project Stage</div>
            <div class="val">${stageLabelMap[p.stage] || p.stage}</div>
          </div>
          <div class="detail-field" style="margin-top:16px;">
            <div class="lbl">Confidentiality</div>
            <div class="val">${p.confidentiality === 'meeting_only' ? '🔒 Details discussed in meeting only' : '🌐 Public pitch'}</div>
          </div>
          <div class="detail-field" style="margin-top:16px;">
            <div class="lbl">Expiry Date</div>
            <div class="val">${p.expiry_date || '—'}</div>
          </div>
        </div>
      </div>

      ${isOwner ? `<div class="action-bar">${ownerActions}</div>` : ''}
    </div>

    ${visitorArea}`;
}

function publishPost() {
  const all = getSessionPosts();
  const idx = all.findIndex(p => p.id === postId);
  all[idx].status = 'active';
  saveSessionPosts(all);
  addLog('POST_PUBLISHED', 'post', postId);
  renderPost();
}

function deletePost() {
  if (!confirm('Are you sure you want to delete this post?')) return;
  saveSessionPosts(getSessionPosts().filter(p => p.id !== postId));
  addLog('POST_DELETED', 'post', postId);
  window.location.href = 'dashboard.html';
}

function markPartnerFound() {
  if (!confirm('Mark this post as "Partner Found"? It will be closed to new requests.')) return;
  const all = getSessionPosts();
  const idx = all.findIndex(p => p.id === postId);
  all[idx].status = 'partner_found';
  saveSessionPosts(all);
  addLog('PARTNER_FOUND', 'post', postId);
  renderPost();
}

function requestMeeting() {
  const msg = (document.getElementById('interestMsg') || {}).value || '';
  if (!msg.trim()) { alert('Please write a message before submitting.'); return; }

  const ndaCheck = document.getElementById('ndaCheck');
  if (ndaCheck && !ndaCheck.checked) { alert('You must accept the NDA to proceed.'); return; }

  const requests = JSON.parse(sessionStorage.getItem('healthai_meeting_requests') || '[]');
  const newReq = {
    id: Date.now(), post_id: postId, from_user_id: userId,
    message: msg.trim(), nda_accepted: ndaCheck ? ndaCheck.checked : false,
    status: 'pending', created_at: new Date().toISOString().slice(0, 10)
  };
  requests.push(newReq);
  sessionStorage.setItem('healthai_meeting_requests', JSON.stringify(requests));

  const all = getSessionPosts();
  const idx = all.findIndex(p => p.id === postId);
  if (idx !== -1) { all[idx].status = 'meeting_scheduled'; saveSessionPosts(all); }

  addLog('MEETING_REQUEST', 'meeting_request', newReq.id);
  sessionStorage.setItem('healthai_pending_request', JSON.stringify(newReq));
  window.location.href = 'meeting-request.html?post_id=' + postId;
}

renderPost();
