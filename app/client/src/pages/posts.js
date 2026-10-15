import { postsApi } from '../services/posts.api.js';
import { escapeHtml } from '../utils/escape-html.js';

const el = (id) => document.getElementById(id);

let selectedCategory = '';
let selectedPost = null;
let previousFocus = null;
let feedRequest = 0;
let detailRequest = 0;

function notice(message) {
  const target = el('overlay').classList.contains('open')
    ? el('modalNotice')
    : el('notice');

  target.innerHTML = message
    ? '<div class="notice">' + escapeHtml(message) + '</div>'
    : '';
}

// Khan's mobile app owns the login session. Ask it to clear the session
// and return to its existing Login screen; no token enters the web page.
const logoutButton = el('logout');

function logoutFailed() {
  logoutButton.disabled = false;
  logoutButton.textContent = 'Log out';
  notice('Unable to log out. Please try again.');
}

if (typeof window.ReactNativeWebView?.postMessage === 'function') {
  logoutButton.hidden = false;
  window.addEventListener('summit:logout-error', logoutFailed);

  logoutButton.addEventListener('click', () => {
    if (logoutButton.disabled) return;

    logoutButton.disabled = true;
    logoutButton.textContent = 'Logging out…';

    try {
      window.ReactNativeWebView.postMessage('summit:logout');
    } catch {
      logoutFailed();
    }
  });
}

async function withButton(button, action) {
  if (button.disabled) return;

  button.disabled = true;
  notice('');

  try {
    await action();
  } catch (error) {
    notice(error.message || 'Something went wrong. Please try again.');
  } finally {
    button.disabled = false;
  }
}

function postCard(post) {
  const id = escapeHtml(post.id);

  return (
    '<article class="post card"><div class="vote">' +
    '<button data-vote="' +
    id +
    '" data-value="1" aria-label="Upvote">▲</button>' +
    '<strong>' +
    Number(post.voteCount) +
    '</strong>' +
    '<button data-vote="' +
    id +
    '" data-value="-1" aria-label="Downvote">▼</button>' +
    '</div><div class="post-body"><div class="meta"><span class="pill">' +
    escapeHtml(post.category) +
    '</span><span>Posted by ' +
    escapeHtml(post.author) +
    '</span></div><h2>' +
    '<button class="post-title" data-open="' +
    id +
    '">' +
    escapeHtml(post.title) +
    '</button></h2>' +
    '<p class="preview">' +
    escapeHtml(post.description) +
    '</p><div class="post-actions">' +
    '<button data-open="' +
    id +
    '">' +
    Number(post.commentCount) +
    ' comments</button>' +
    (post.isOwner
      ? '<button data-open="' + id + '">Edit</button>'
      : '') +
    '</div></div></article>'
  );
}

async function loadPosts() {
  const request = ++feedRequest;
  const posts = await postsApi.list(selectedCategory);

  if (request !== feedRequest) return;

  el('postCount').textContent =
    posts.length + ' post' + (posts.length === 1 ? '' : 's');

  el('feed').innerHTML = posts.length
    ? posts.map(postCard).join('')
    : '<div class="empty card">No posts yet. Publish the first one.</div>';
}

async function chooseCategory(category) {
  selectedCategory = category;

  el('feedHeading').textContent = category || 'Home feed';
  el('mobileCategory').value = category;

  document.querySelectorAll('.nav').forEach((button) => {
    button.classList.toggle(
      'active',
      button.dataset.category === category,
    );
  });

  await loadPosts();
}

function renderComments(comments) {
  el('commentList').innerHTML = comments.length
    ? comments
        .map(
          (comment) =>
            '<div class="comment"><span class="avatar">' +
            escapeHtml(comment.author[0] || '?') +
            '</span><div><strong>' +
            escapeHtml(comment.author) +
            '</strong><p>' +
            escapeHtml(comment.body) +
            '</p></div></div>',
        )
        .join('')
    : '<div class="empty">No comments yet.</div>';
}

async function openPost(id) {
  const request = ++detailRequest;

  const [post, comments] = await Promise.all([
    postsApi.get(id),
    postsApi.comments(id),
  ]);

  if (request !== detailRequest) return;

  if (!el('overlay').classList.contains('open')) {
    previousFocus = document.activeElement;
  }

  selectedPost = post;

  el('detailTitle').textContent = post.title;

  el('detailMeta').innerHTML =
    '<span class="pill">' +
    escapeHtml(post.category) +
    '</span><span>Posted by ' +
    escapeHtml(post.author) +
    '</span><span>• ' +
    Number(post.voteCount) +
    ' votes</span>';

  el('detailText').textContent = post.description;

  el('ownerEdit').classList.toggle('hidden', !post.isOwner);

  if (post.isOwner) {
    el('editTitle').value = post.title;
    el('editDescription').value = post.description;
    el('editCategory').value = post.category;
    el('editAnonymous').checked = post.anonymous;
  }

  renderComments(comments);

  el('modalNotice').innerHTML = '';
  el('overlay').classList.add('open');
  el('closeModal').focus();
}

function closePost() {
  detailRequest += 1;

  el('overlay').classList.remove('open');
  selectedPost = null;
  el('commentBody').value = '';

  previousFocus?.focus();
}

el('feed').addEventListener('click', (event) => {
  const button = event.target.closest('button');

  if (!button) return;

  if (button.dataset.open) {
    void withButton(
      button,
      () => openPost(button.dataset.open),
    );
  } else if (button.dataset.vote) {
    void withButton(button, async () => {
      await postsApi.vote(
        button.dataset.vote,
        Number(button.dataset.value),
      );

      await loadPosts();
    });
  }
});

el('postForm').addEventListener('submit', (event) => {
  event.preventDefault();

  void withButton(
    event.submitter || el('postForm').querySelector('button'),
    async () => {
      const input = {
        title: el('title').value,
        description: el('description').value,
        category: el('category').value,
        anonymous: el('anonymous').checked,
      };

      await postsApi.create(input);

      el('postForm').reset();

      await chooseCategory(
        selectedCategory ? input.category : '',
      );
    },
  );
});

el('commentForm').addEventListener('submit', (event) => {
  event.preventDefault();

  if (!selectedPost) return;

  const id = selectedPost.id;

  void withButton(
    event.submitter || el('commentForm').querySelector('button'),
    async () => {
      await postsApi.comment(id, el('commentBody').value);

      if (selectedPost?.id === id) {
        el('commentBody').value = '';

        const comments = await postsApi.comments(id);

        if (selectedPost?.id === id) {
          renderComments(comments);
        }
      }

      await loadPosts();
    },
  );
});

el('saveEdit').addEventListener('click', () => {
  if (!selectedPost) return;

  const id = selectedPost.id;

  void withButton(el('saveEdit'), async () => {
    await postsApi.update(id, {
      title: el('editTitle').value,
      description: el('editDescription').value,
      category: el('editCategory').value,
      anonymous: el('editAnonymous').checked,
    });

    if (selectedPost?.id === id) {
      await openPost(id);
    }

    await loadPosts();
  });
});

el('deletePost').addEventListener('click', () => {
  if (!selectedPost || !window.confirm('Delete this post?')) {
    return;
  }

  const id = selectedPost.id;

  void withButton(el('deletePost'), async () => {
    await postsApi.remove(id);

    if (selectedPost?.id === id) {
      closePost();
    }

    await loadPosts();
  });
});

el('closeModal').addEventListener('click', closePost);

el('overlay').addEventListener('click', (event) => {
  if (event.target === el('overlay')) {
    closePost();
  }
});

document.addEventListener('keydown', (event) => {
  if (!el('overlay').classList.contains('open')) {
    return;
  }

  if (event.key === 'Escape') {
    closePost();
  }

  if (event.key === 'Tab') {
    const items = [
      ...el('overlay').querySelectorAll(
        'button, input, textarea, select',
      ),
    ].filter(
      (item) => !item.disabled && item.getClientRects().length,
    );

    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first?.focus();
    }
  }
});

async function initialize() {
  const categories = await postsApi.categories();

  el('category').innerHTML = categories
    .map(
      (category) =>
        '<option>' + escapeHtml(category) + '</option>',
    )
    .join('');

  el('category').value = 'Technology';

  el('editCategory').innerHTML = el('category').innerHTML;

  el('categoryNav').innerHTML = categories
    .map(
      (category) =>
        '<button class="nav" data-category="' +
        escapeHtml(category) +
        '">' +
        escapeHtml(category) +
        '</button>',
    )
    .join('');

  el('mobileCategory').innerHTML += el('category').innerHTML;

  document.querySelectorAll('.nav').forEach((button) => {
    button.addEventListener('click', () => {
      void withButton(button, () =>
        chooseCategory(button.dataset.category || ''),
      );
    });
  });

  el('mobileCategory').addEventListener('change', () => {
    chooseCategory(el('mobileCategory').value).catch((error) =>
      notice(error.message),
    );
  });

  await loadPosts();
}

initialize().catch((error) => notice(error.message));
