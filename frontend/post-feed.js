renderNav('feed');

const currentUser = getCurrentUser();
const userCity    = currentUser ? currentUser.city : '';

const stageLabelMap = {
  idea: 'Idea', concept_validation: 'Concept Validation',
  prototype: 'Prototype', pilot_testing: 'Pilot Testing',
  pre_deployment: 'Pre-Deployment'
};
const statusLabels = {
  active: 'Active', draft: 'Draft',
  meeting_scheduled: 'Meeting Scheduled',
  partner_found: 'Partner Found', expired: 'Expired'
};

function renderPosts(posts) {
  const list  = document.getElementById('postList');
  const count = document.getElementById('resultCount');
  count.textContent = posts.length + ' post(s) found';

  if (posts.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>No posts match your filters.</p>
      </div>`;
    return;
  }

  list.innerHTML = posts.map(post => {
    const author    = MOCK_USERS.find(u => u.id === post.user_id);
    const cityMatch = userCity && post.city &&
      post.city.toLowerCase() === userCity.toLowerCase();

    return `
      <div class="post-card">
        <div style="flex:1;">
          <div class="post-title">${post.title}</div>
          <div class="post-meta">
            ${post.domain} &middot; ${post.city}, ${post.country}
            &middot; ${author ? author.name : 'Unknown'}
            &middot; ${post.created_at}
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

function getFilteredPosts() {
  const domain    = document.getElementById('filterDomain').value.trim().toLowerCase();
  const city      = document.getElementById('filterCity').value.trim().toLowerCase();
  const status    = document.getElementById('filterStatus').value;
  const expertise = document.getElementById('filterExpertise').value.trim().toLowerCase();
  const stage     = document.getElementById('filterStage').value;

  return getSessionPosts().filter(post => {
    if (domain    && !post.domain.toLowerCase().includes(domain))              return false;
    if (city      && !post.city.toLowerCase().includes(city))                  return false;
    if (status    && post.status !== status)                                   return false;
    if (expertise && !post.expertise_needed.toLowerCase().includes(expertise)) return false;
    if (stage     && post.stage !== stage)                                     return false;
    return true;
  });
}

function applyFilters() { renderPosts(getFilteredPosts()); }

function resetFilters() {
  ['filterDomain','filterCity','filterExpertise'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterStage').value  = '';
  renderPosts(getSessionPosts());
}

renderPosts(getSessionPosts());
