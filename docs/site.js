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

function renderProject(project) {
  const article = element('article', undefined, 'project');
  article.id = project.id;
  const header = element('div', undefined, 'project-heading');
  header.append(element('h3', project.name));
  header.append(element('span', statuses[project.status], `status ${project.status}`));
  const body = element('div', undefined, 'project-body');
  body.append(header, element('p', project.description));
  article.append(body);

  if (project.milestones.length) {
    const completed = project.milestones.filter(milestone => milestone.done).length;
    const total = project.milestones.length;
    const progress = element('div', undefined, 'project-progress');
    const label = element('div', undefined, 'progress-label');
    label.append(element('span', 'Progress'), element('span', `${completed} of ${total} milestones`));
    const bar = element('progress');
    bar.max = total;
    bar.value = completed;
    bar.setAttribute('aria-label', `${project.name} milestones completed`);
    progress.append(label, bar);
    const next = project.milestones.find(milestone => !milestone.done);
    if (next) {
      const nextStep = element('p', undefined, 'next-step');
      nextStep.append(element('strong', 'Up next'), ` ${next.label}`);
      progress.append(nextStep);
    }
    article.append(progress);
  }

  const projectLinks = [...project.links];
  if (project.pitch?.length || project.screenshots?.length) {
    projectLinks.unshift({
      label: 'Read More',
      url: `./project.html?id=${encodeURIComponent(project.slug ?? project.id)}`,
    });
  }
  if (projectLinks.length) {
    const links = element('div', undefined, 'project-links');
    renderLinks(projectLinks, links);
    body.append(links);
  }
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

  for (const update of updates.slice(0, 5)) {
    const item = element('li');
    const date = element('time', formatDate.format(new Date(update.date)));
    date.dateTime = update.date;
    const title = element('a', update.project.name);
    title.href = `#${update.project.id}`;
    title.addEventListener('click', () => {
      if (!document.getElementById(update.project.id)) renderProjects();
    });
    item.append(date, title, element('p', update.text));
    updateList.append(item);
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
  renderProjects();
  renderUpdates();
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

  if (project.screenshots?.length) {
    const gallery = document.querySelector('#screenshot-grid');
    for (const screenshot of project.screenshots) {
      const figure = element('figure');
      const image = element('img');
      image.src = screenshot.src;
      image.alt = screenshot.alt;
      image.width = screenshot.width;
      image.height = screenshot.height;
      image.loading = 'lazy';
      const link = element('a');
      link.href = screenshot.src;
      link.append(image);
      figure.append(link, element('figcaption', screenshot.caption));
      gallery.append(figure);
    }
    document.querySelector('#screenshots').hidden = false;
  }

  message.hidden = true;
  document.querySelector('#project-detail').hidden = false;
}

if (projectList) renderHome();
else renderProjectDetails();
