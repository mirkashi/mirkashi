# readme-art

Every image in the profile README is generated here. Nothing is a screenshot of
a third-party widget, so the whole page shares one palette, one type scale and
one grid — and it stays in sync with the numbers in
[`data/contributions.json`](data/contributions.json).

## Pipeline

```
data/contributions.json ─┐
                         ├─► sections.mjs ─┐
data.mjs (copy, links) ──┘   signals.mjs    ├─► build.mjs ─► ../../assets/*.svg
                             archive.mjs    │
                             projects.mjs ──┘   (embeds screenshots as data URIs)
```

| file | what it renders |
| :--- | :--- |
| `theme.mjs` | palette, type scale, glyphs (Simple Icons + the MIT devicon VS Code mark), shared primitives |
| `data.mjs` | the single source of truth for copy, links, stack and projects |
| `sections.mjs` | hero, about + terminal, tech stack |
| `projects.mjs` | project cards — framed preview window, title block, chips, link rail |
| `archive.mjs` | projects header, the compact "more builds" list, studio strip, divider |
| `contrib.mjs` | the contribution grid, streak stats and legend |
| `signals.mjs` | GitHub pulse (tiles, language mix) and the closing identity panel |
| `build.mjs` | writes everything into `/assets` |

## Commands

```bash
# 1. refresh the numbers (needs an authenticated gh CLI)
./tools/readme-art/fetch-stats.sh

# 2. rebuild every asset
cd tools/readme-art && npm install && node build.mjs

# 3. optional: rasterise to /tmp/readme-preview for a visual check
node build.mjs --preview
```

## Notes

* Panels are authored at **1000px wide** (the hero at 1200px) so they render
  close to 1:1 in GitHub's README column and stay legible on mobile.
* Animation is SMIL only — animated gradients, a contribution scanner, a
  twinkling skyline and a self-typing cursor. No JavaScript, no flashing.
* Screenshots are embedded as JPEG data URIs inside the card SVGs: that keeps
  each card a single asset, so GitHub cannot render a seam between two images.
* Photos come from `profile-site/assets/img/`, where the portfolio's own
  screenshots already live.
