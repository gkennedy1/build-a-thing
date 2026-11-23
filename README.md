# Build a Thing

A public tracker for Greg Kennedy’s side projects. The static site lives in `docs/` and runs without a build step or external dependencies. Open `docs/index.html` to preview it locally.

## Updating a project

Edit `docs/projects.js`. Give each project a unique, stable `id` using lowercase letters, numbers and hyphens. Use `planned`, `in-progress`, `paused` or `shipped` for its status. Pick a status separately from milestone completion so a paused project can still show how far it got.

Set an optional `slug` to change the project detail URL. Keep it distinct from other project IDs and slugs. Links using the stable `id` still work.

Add milestones in order and set `done` to `true` as you complete them. The site displays the completed count and the first open milestone. Use `YYYY-MM-DD` for dated updates. The home page shows the five most recent updates across all projects. Keep `links`, `milestones` and `updates` as empty arrays when there’s nothing to share.

Use the optional `pitch` array for paragraphs about why you’re building a project. Use `screenshots` for images, each with a relative `src`, `width`, `height`, `alt` text and `caption`. Either field adds a project details link to the tracker. Store screenshots under `docs/images/`.

## Publishing

GitHub Pages publishes from `main` and `/docs` to [gkennedy1.github.io/build-a-thing](https://gkennedy1.github.io/build-a-thing/). Pushes to `main` publish automatically. GitHub Pages can take a few minutes to serve changes. The source is configured under **Settings → Pages**.
