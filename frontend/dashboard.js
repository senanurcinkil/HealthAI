requireLogin();
renderNav('dashboard');

const user = getCurrentUser();
document.getElementById('welcomeMsg').textContent =
  'Welcome back, ' + (user ? user.name : 'User') + '!';

const statusLabels = {
  active: 'Active', draft: 'Draft',
  meeting_scheduled: 'Meeting Scheduled',
  partner_found: 'Partner Found', expired: 'Expired',
};

function postCardHtml(post) {
  return `
    <div class="post-card">
      <div style="flex:1;">
        <div class="post-title">${post.title}</div>
        <div class="post-meta">${post.domain} &middot; ${post.city} &middot; ${post.author_name} &middot; ${post.created_at}</div>
        <div class="post-tags" style="margin-top:6px;">
          <span class="badge badge-${post.status}">${statusLabels[post.status] || post.status}</span>
          <span class="tag">${post.stage}</span>
        </div>
      </div>
      <a href="post-detail.html?id=${post.id}" class="btn btn-outline btn-sm">View →</a>
    </div>`;
}

function emptyState(msg, link) {
  return `<div class="empty-state"><div class="empty-icon">📋</div><p>${msg}</p>${link ? `<a href="${link.href}" class="btn btn-primary" style="margin-top:12px;">${link.label}</a>` : ''}</div>`;
}

async function init() {
  // Show skeletons while loading
  document.getElementById('myPostsList').innerHTML     = skeletonCards(2);
  document.getElementById('recentPostsList').innerHTML = skeletonCards(3);

  try {
    const [allPosts, myPosts] = await Promise.all([
      apiGet('/api/posts?status=active'),
      apiGet('/api/posts/mine'),
    ]);

    const meetings = allPosts.filter(p => p.status === 'meeting_scheduled');
    document.getElementById('statGrid').innerHTML = `
      <div class="stat-card"><div class="num">${allPosts.length}</div><div class="lbl">Active Posts</div></div>
      <div class="stat-card"><div class="num">${myPosts.length}</div><div class="lbl">My Posts</div></div>
      <div class="stat-card"><div class="num">${meetings.length}</div><div class="lbl">Meetings Scheduled</div></div>
    `;

    const myList = document.getElementById('myPostsList');
    myList.innerHTML = myPosts.length
      ? myPosts.map(postCardHtml).join('')
      : emptyState('You have no posts yet.', { href: 'create-post.html', label: '+ Create your first post' });

    const userId = user ? user.id : -1;
    const others = allPosts.filter(p => p.user_id !== userId).slice(0, 5);
    const recentList = document.getElementById('recentPostsList');
    recentList.innerHTML = others.length
      ? others.map(postCardHtml).join('')
      : emptyState('No recent posts from other users.');

  } catch (err) {
    toast(err.message || 'Failed to load dashboard data.', 'error');
  }
}

init();
