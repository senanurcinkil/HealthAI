renderNav('dashboard');

const user   = getCurrentUser();
const posts  = getSessionPosts();
const userId = parseInt(sessionStorage.getItem('healthai_user_id'));

document.getElementById('welcomeMsg').textContent =
  'Welcome back, ' + (user ? user.name : 'User') + '!';

const myPosts      = posts.filter(p => p.user_id === userId);
const activePosts  = posts.filter(p => p.status === 'active');
const meetingPosts = posts.filter(p => p.status === 'meeting_scheduled');

document.getElementById('statGrid').innerHTML = `
  <div class="stat-card"><div class="num">${posts.length}</div><div class="lbl">Total Posts</div></div>
  <div class="stat-card"><div class="num">${activePosts.length}</div><div class="lbl">Active Posts</div></div>
  <div class="stat-card"><div class="num">${myPosts.length}</div><div class="lbl">My Posts</div></div>
  <div class="stat-card"><div class="num">${meetingPosts.length}</div><div class="lbl">Meetings Scheduled</div></div>
`;

const statusLabels = {
  active: 'Active', draft: 'Draft',
  meeting_scheduled: 'Meeting Scheduled',
  partner_found: 'Partner Found', expired: 'Expired'
};

function postCardHtml(post) {
  const author = MOCK_USERS.find(u => u.id === post.user_id);
  return `
    <div class="post-card">
      <div style="flex:1;">
        <div class="post-title">${post.title}</div>
        <div class="post-meta">${post.domain} &middot; ${post.city} &middot; ${author ? author.name : ''} &middot; ${post.created_at}</div>
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

const myList = document.getElementById('myPostsList');
myList.innerHTML = myPosts.length
  ? myPosts.map(postCardHtml).join('')
  : emptyState('You have no posts yet.', { href: 'create-post.html', label: '+ Create your first post' });

const recentList = document.getElementById('recentPostsList');
const others = posts.filter(p => p.user_id !== userId && p.status === 'active').slice(0, 5);
recentList.innerHTML = others.length
  ? others.map(postCardHtml).join('')
  : emptyState('No recent posts from other users.');
