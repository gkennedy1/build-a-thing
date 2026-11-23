async function initProjectLikes(projectId) {
  const reaction = document.querySelector('.project-reaction');
  const button = reaction.querySelector('button');
  const label = button.querySelector('span');
  const count = reaction.querySelector('.like-count');
  const message = document.querySelector('.like-message');
  const storageKey = `build-a-thing:liked:${projectId}`;
  const api = 'https://abacus.jasoncameron.dev';
  const counter = `gkennedy1.github.io-build-a-thing-likes/${encodeURIComponent(projectId)}`;

  function showCount(value) {
    count.textContent = `${value.toLocaleString('en-AU')} ${value === 1 ? 'like' : 'likes'}`;
  }

  function showLiked() {
    button.dataset.liked = '';
    button.disabled = true;
    label.textContent = 'Liked';
  }

  async function readCounter(action) {
    const response = await fetch(`${api}/${action}/${counter}`, {
      cache: 'no-store',
      credentials: 'omit',
      keepalive: action === 'hit',
      signal: AbortSignal.timeout(8000),
    });
    if (action === 'get' && response.status === 404) return 0;
    if (!response.ok) throw new Error('Counter request failed.');
    const { value } = await response.json();
    if (!Number.isSafeInteger(value) || value < 0) throw new Error('Invalid count.');
    return value;
  }

  let storageAvailable = true;
  try {
    if (localStorage.getItem(storageKey)) showLiked();
  } catch {
    storageAvailable = false;
    message.textContent = 'Browser storage is needed to leave a like.';
  }

  button.addEventListener('click', async () => {
    button.disabled = true;
    message.textContent = '';
    try {
      if (localStorage.getItem(storageKey)) {
        showLiked();
        return;
      }
      localStorage.setItem(storageKey, '1');
    } catch {
      message.textContent = 'Browser storage is needed to leave a like.';
      return;
    }

    try {
      showCount(await readCounter('hit'));
      showLiked();
    } catch {
      try {
        localStorage.removeItem(storageKey);
        button.disabled = false;
      } catch {
        // Keep the button disabled if the browser no longer allows storage.
      }
      message.textContent = 'Couldn’t confirm your like. Try again in a moment.';
    }
  });

  try {
    showCount(await readCounter('get'));
  } catch {
    message.textContent = 'Couldn’t load the like count.';
  } finally {
    button.disabled = !storageAvailable || button.hasAttribute('data-liked');
  }
}
