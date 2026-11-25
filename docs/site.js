const statuses = {
  'in-progress': 'In progress',
  planned: 'Planned',
  paused: 'Paused',
  shipped: 'Shipped',
};

const projectList = document.querySelector('#project-list');
const updateList = document.querySelector('#update-list');
const filters = document.querySelector('.filters');
const results = document.querySelector('#results');

function element(tag, content, className) {
  const node = document.createElement(tag);
  if (content !== undefined) node.textContent = content;
  if (className) node.className = className;
  return node;
}

function renderLinks(links, container) {
  for (const { label, url } of links) {
    const anchor = element('a', label);
    anchor.href = url;
    container.append(anchor);
  }
}

function projectDetailsUrl(project) {
  if (project.pitch?.length || project.screenshots?.length) {
    return `./project.html?id=${encodeURIComponent(project.slug ?? project.id)}`;
  }
}

function renderFeaturedProject() {
  const project = projects.find(project => project.id === 'cellar-dweller');
  if (!project) return;

  const featured = document.querySelector('.featured-project');
  const link = featured.querySelector('a');
  link.textContent = project.name;
  link.href = projectDetailsUrl(project) ?? `#${project.id}`;
  featured.hidden = false;
}

function renderProject(project) {
  const article = element('article', undefined, 'project');
  article.id = project.id;
  const body = element('div', undefined, 'project-body');
  body.append(element('h3', project.name), element('p', project.description));
  article.append(body, element('span', statuses[project.status], `status ${project.status}`));

  const screenshot = project.screenshots?.[0];
  if (screenshot) {
    const image = element('img', undefined, 'project-preview');
    image.src = screenshot.src;
    image.alt = screenshot.alt;
    image.width = screenshot.width;
    image.height = screenshot.height;
    image.loading = 'lazy';
    article.append(image);
  }

  const actions = element('div', undefined, 'project-actions');
  const projectLinks = [...project.links];
  const detailsUrl = projectDetailsUrl(project);
  if (detailsUrl) projectLinks.unshift({ label: 'Read More', url: detailsUrl });
  if (projectLinks.length) {
    const links = element('div', undefined, 'project-links');
    renderLinks(projectLinks, links);
    actions.append(links);
  }
  if (project.milestones.length) {
    const completed = project.milestones.filter(milestone => milestone.done).length;
    const total = project.milestones.length;
    const progress = element('details', undefined, 'project-progress');
    const summary = element('summary', `${completed} of ${total} milestones`);
    const bar = element('progress');
    bar.max = total;
    bar.value = completed;
    bar.setAttribute('aria-label', `${project.name} milestones completed`);
    progress.append(summary, bar);
    const next = project.milestones.find(milestone => !milestone.done);
    if (next) {
      const nextStep = element('p', undefined, 'next-step');
      nextStep.append(element('strong', 'Up next'), ` ${next.label}`);
      progress.append(nextStep);
    }
    actions.append(progress);
  }
  if (actions.childElementCount) body.append(actions);
  return article;
}

function renderProjects(status = 'all', announce = false) {
  const visible = status === 'all' ? projects : projects.filter(project => project.status === status);
  const message = visible.length ? '' : 'No projects to show.';
  projectList.replaceChildren(...visible.map(renderProject));
  if (message) projectList.append(element('p', message, 'empty'));
  if (announce) results.textContent = message || `${visible.length} ${visible.length === 1 ? 'project' : 'projects'} shown.`;

  for (const button of filters.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.value === status));
  }
}

function renderUpdates() {
  const updates = projects.flatMap(project => project.updates.map(update => ({ ...update, project })));
  updates.sort((first, second) => second.date.localeCompare(first.date));
  const formatDate = new Intl.DateTimeFormat('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });

  const groups = new Map();
  for (const update of updates.slice(0, 5)) {
    if (!groups.has(update.date)) groups.set(update.date, []);
    groups.get(update.date).push(update);
  }
  for (const [day, dayUpdates] of groups) {
    const group = element('li', undefined, 'update-day');
    const date = element('time', formatDate.format(new Date(day)));
    date.dateTime = day;
    const entries = element('ul', undefined, 'update-entries');
    for (const update of dayUpdates) {
      const item = element('li');
      const title = element('a', update.project.name);
      title.href = `#${update.project.id}`;
      title.addEventListener('click', () => {
        if (!document.getElementById(update.project.id)) renderProjects();
      });
      item.append(title, element('p', update.text));
      entries.append(item);
    }
    group.append(date, entries);
    updateList.append(group);
  }

  if (!updates.length) updateList.append(element('li', 'No updates yet.', 'muted'));
}

function renderHome() {
  if (typeof projects === 'undefined') {
    projectList.replaceChildren(element('p', 'Projects couldn’t load. Refresh the page to try again.', 'empty'));
    updateList.append(element('li', 'Updates couldn’t load.', 'muted'));
    return;
  }

  const activeStatuses = Object.entries(statuses).filter(([status]) => projects.some(project => project.status === status));
  if (activeStatuses.length > 1) {
    for (const [status, label] of [['all', 'All projects'], ...activeStatuses]) {
      const button = element('button', label);
      button.type = 'button';
      button.value = status;
      button.addEventListener('click', () => renderProjects(status, true));
      filters.append(button);
    }
    filters.hidden = false;
  }
  renderFeaturedProject();
  renderProjects();
  renderUpdates();
}

function renderScreenshots(screenshots) {
  const gallery = document.querySelector('#screenshot-grid');
  const viewer = document.querySelector('.screenshot-viewer');
  const canEnlarge = typeof viewer?.showModal === 'function';
  const frames = screenshots.map(screenshot => {
    const figure = element('figure', undefined, screenshot.height > screenshot.width ? 'screenshot-portrait' : undefined);
    const image = element('img');
    image.src = screenshot.src;
    image.alt = screenshot.alt;
    image.width = screenshot.width;
    image.height = screenshot.height;
    image.loading = 'lazy';
    const frame = element(canEnlarge ? 'button' : 'div', undefined, 'screenshot-frame');
    if (canEnlarge) {
      frame.type = 'button';
      frame.setAttribute('aria-haspopup', 'dialog');
    }
    frame.append(image);
    figure.append(frame, element('figcaption', screenshot.caption));
    gallery.append(figure);
    return frame;
  });
  document.querySelector('#screenshots').hidden = false;
  if (!canEnlarge) return;

  const image = element('img');
  const stage = viewer.querySelector('.screenshot-viewer-image');
  stage.prepend(image);
  const caption = viewer.querySelector('#screenshot-viewer-caption');
  const position = viewer.querySelector('[data-viewer-position]');
  const navigation = viewer.querySelector('.screenshot-viewer-nav');
  navigation.hidden = screenshots.length === 1;
  let active = 0;
  let opener;
  let swipeStart;

  function showScreenshot(index) {
    active = (index + screenshots.length) % screenshots.length;
    const screenshot = screenshots[active];
    image.alt = screenshot.alt;
    image.src = screenshot.src;
    viewer.style.setProperty('--screenshot-ratio', screenshot.width / screenshot.height);
    caption.textContent = screenshot.caption;
    position.textContent = `${active + 1} of ${screenshots.length}`;
  }

  frames.forEach((frame, index) => {
    frame.addEventListener('click', () => {
      opener = frame;
      showScreenshot(index);
      viewer.showModal();
    });
  });

  viewer.querySelector('[data-viewer-close]').addEventListener('click', () => viewer.close());
  viewer.querySelector('[data-viewer-previous]').addEventListener('click', () => showScreenshot(active - 1));
  viewer.querySelector('[data-viewer-next]').addEventListener('click', () => showScreenshot(active + 1));
  viewer.addEventListener('click', event => {
    if (event.target === viewer) viewer.close();
  });
  viewer.addEventListener('keydown', event => {
    if (navigation.hidden || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showScreenshot(active + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  stage.addEventListener('pointerdown', event => {
    if (navigation.hidden || event.pointerType !== 'touch' || !event.isPrimary || event.target.closest('button')) return;
    swipeStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  stage.addEventListener('pointerup', event => {
    if (event.pointerId !== swipeStart?.id) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = undefined;
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      showScreenshot(active + (dx < 0 ? 1 : -1));
    }
  });
  stage.addEventListener('pointercancel', event => {
    if (event.pointerId === swipeStart?.id) swipeStart = undefined;
  });
  viewer.addEventListener('close', () => {
    swipeStart = undefined;
    opener?.focus({ preventScroll: true });
  });
}

function renderProjectDetails() {
  const message = document.querySelector('#detail-message');
  if (typeof projects === 'undefined') {
    message.textContent = 'Project details couldn’t load. Refresh the page to try again.';
    return;
  }

  const url = new URL(location.href);
  const id = url.searchParams.get('id');
  const project = projects.find(project => project.slug === id || project.id === id);
  if (!project) {
    message.textContent = 'Project not found. ';
    const link = element('a', 'Browse projects');
    link.href = './index.html#projects';
    message.append(link);
    return;
  }

  if (project.slug && id !== project.slug && url.protocol !== 'file:') {
    url.searchParams.set('id', project.slug);
    history.replaceState(history.state, '', url);
  }

  document.title = `${project.name} — Build a Thing`;
  document.querySelector('#project-title').textContent = project.name;
  document.querySelector('#project-description').textContent = project.description;
  const status = document.querySelector('#project-status');
  status.textContent = statuses[project.status];
  status.className = `status ${project.status}`;

  if (project.links.length) {
    const links = document.querySelector('#detail-links');
    renderLinks(project.links, links);
    links.hidden = false;
  }

  if (project.pitch?.length) {
    const pitch = document.querySelector('#pitch-copy');
    pitch.append(...project.pitch.map(paragraph => element('p', paragraph)));
    document.querySelector('#pitch').hidden = false;
  }

  if (project.screenshots?.length) renderScreenshots(project.screenshots);

  message.hidden = true;
  document.querySelector('#project-detail').hidden = false;
  if (typeof initProjectLikes === 'function') initProjectLikes(project.id);
}

if (projectList) renderHome();
else renderProjectDetails();
