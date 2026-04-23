requireLogin();
renderNav('feed');

const currentUser = getCurrentUser();
const userCity    = currentUser ? currentUser.city : '';

const stageLabelMap = {
  idea: 'Idea', concept_validation: 'Concept Validation',
  prototype: 'Prototype', pilot_testing: 'Pilot Testing',
  pre_deployment: 'Pre-Deployment',
};
const statusLabels = {
  active: 'Active', draft: 'Draft',
  meeting_scheduled: 'Meeting Scheduled',
  partner_found: 'Partner Found', expired: 'Expired',
};

function renderPosts(posts) {
  const list  = document.getElementById('postList');
  const count = document.getElementById('resultCount');
  count.textContent = posts.length + ' post(s) found';

  if (posts.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>No posts match your filters.</p></div>`;
    return;
  }

  list.innerHTML = posts.map(post => {
    const cityMatch = userCity && post.city &&
      post.city.toLowerCase() === userCity.toLowerCase();
    return `
      <div class="post-card">
        <div style="flex:1;">
          <div class="post-title">${post.title}</div>
          <div class="post-meta">
            ${post.domain} &middot; ${post.city}, ${post.country}
            &middot; ${post.author_name} &middot; ${post.created_at}
            ${cityMatch ? '<span class="city-match"> ★ Same city</span>' : ''}
          </div>
          <div class="post-desc">${post.explanation}</div>
          <div class="post-tags">
            <span class="badge badge-${post.status}">${statusLabels[post.status] || post.status}</span>
            <span class="tag">📍 ${stageLabelMap[post.stage] || post.stage}</span>
            <span class="tag">🔍 ${post.expertise_needed}</span>
            <span class="tag">${post.confidentiality === 'meeting_only' ? '🔒 Confidential' : '🌐 Public'}</span>
          </div>
        </div>
        <a href="post-detail.html?id=${post.id}" class="btn btn-outline btn-sm" style="white-space:nowrap;">View →</a>
      </div>`;
  }).join('');
}

function buildQuery() {
  const params = new URLSearchParams();
  const domain    = document.getElementById('filterDomain').value.trim();
  const city      = document.getElementById('filterCity').value.trim();
  const status    = document.getElementById('filterStatus').value;
  const expertise = document.getElementById('filterExpertise').value.trim();
  const stage     = document.getElementById('filterStage').value;
  if (domain)    params.set('domain', domain);
  if (city)      params.set('city', city);
  if (status)    params.set('status', status);
  if (expertise) params.set('expertise', expertise);
  if (stage)     params.set('stage', stage);
  return params.toString() ? '?' + params.toString() : '';
}

async function applyFilters() {
  document.getElementById('postList').innerHTML = skeletonCards(4);
  document.getElementById('resultCount').textContent = '';
  try {
    const posts = await apiGet('/api/posts' + buildQuery());
    renderPosts(posts);
  } catch (err) {
    toast('Failed to load posts.', 'error');
  }
}

function resetFilters() {
  ['filterDomain','filterCity','filterExpertise'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterStage').value  = '';
  applyFilters();
}

applyFilters();
