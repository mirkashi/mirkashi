#!/usr/bin/env bash
# Refresh tools/readme-art/data/contributions.json from the GitHub API.
#
# The README never embeds a third-party stats widget: every number in the
# GitHub Pulse / contribution panels comes from here, so the artwork and the
# data can be regenerated together.
#
#   ./tools/readme-art/fetch-stats.sh     # needs an authenticated gh CLI
#   node tools/readme-art/build.mjs       # then rebuild the SVG panels
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGIN="${1:-mirkashi}"
OWNER="mirkashi"
STUDIO="BITSANDBYTESDUDE"
OUT="$HERE/data/contributions.json"

echo "→ fetching profile, contributions and repos for @$LOGIN"
gh api graphql -f query='
{
  user(login: "'"$LOGIN"'") {
    login
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { firstDay contributionDays { date contributionCount } }
      }
    }
    repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) {
      totalCount
      nodes { name stargazerCount primaryLanguage { name } }
    }
  }
}' > /tmp/mirkashi-graphql.json

echo "→ language mix for @$OWNER and @$STUDIO"
gh api "users/$OWNER/repos?per_page=100" --jq '[.[] | select(.fork == false) | .language] | map(select(. != null)) | group_by(.) | map({lang: .[0], n: length}) | sort_by(-.n)' > /tmp/mirkashi-langs-owner.json
gh api "users/$STUDIO/repos?per_page=100" --jq '[.[] | select(.fork == false) | .language] | map(select(. != null)) | group_by(.) | map({lang: .[0], n: length}) | sort_by(-.n)' > /tmp/mirkashi-langs-studio.json

# followers is the only field the GraphQL query above cannot see for a public
# viewer of someone else's profile; it comes from the REST endpoint.
FOLLOWERS="$(gh api "users/$LOGIN" --jq '.followers')"

node -e '
const fs = require("fs");
const [gqlPath, ownerPath, studioPath, followers, out] = process.argv.slice(1);
const gql = JSON.parse(fs.readFileSync(gqlPath, "utf8")).data.user;
const cal = gql.contributionsCollection.contributionCalendar;
const owner = JSON.parse(fs.readFileSync(ownerPath, "utf8"));
const studio = JSON.parse(fs.readFileSync(studioPath, "utf8"));

const weeks = cal.weeks.map((w) => w.contributionDays.map((d) => d.contributionCount));
while (weeks[weeks.length - 1].length < 7) weeks[weeks.length - 1].push(0);

const days = cal.weeks.flatMap((w) => w.contributionDays);
const total = days.reduce((t, d) => t + d.contributionCount, 0);
let best = 0, bestDate = null, longest = 0, run = 0, active = 0;
for (const d of days) {
  if (d.contributionCount > best) { best = d.contributionCount; bestDate = d.date; }
  if (d.contributionCount > 0) { run += 1; active += 1; } else { run = 0; }
  if (run > longest) longest = run;
}
let current = 0;
for (let i = days.length - 1; i >= 0; i -= 1) {
  if (days[i].contributionCount > 0) current += 1; else break;
}

const merge = {};
for (const row of [...owner, ...studio]) merge[row.lang] = (merge[row.lang] || 0) + row.n;
const combined = Object.entries(merge).map(([lang, n]) => ({ lang, n })).sort((a, b) => b.n - a.n);

const stats = {
  updated: new Date().toISOString().slice(0, 10),
  login: gql.login,
  repos: gql.repositories.totalCount,
  stars: gql.repositories.nodes.reduce((t, r) => t + r.stargazerCount, 0),
  followers: Number(followers),
  contributions: total,
  since: 2023,
  bestDay: { count: best, date: bestDate },
  longestStreak: longest,
  currentStreak: current,
  activeDays: active,
  weeks,
  firstDays: cal.weeks.map((w) => w.firstDay),
  range: { from: days[0].date, to: days[days.length - 1].date },
  // ordered by repo count; the README footer prints the whole list
  languages: combined.map((l) => l.lang),
  languageMix: { owner, studio, combined },
  totalRepos: combined.reduce((t, l) => t + l.n, 0),
  studioRepos: studio.reduce((t, l) => t + l.n, 0),
};
fs.writeFileSync(out, JSON.stringify(stats, null, 1) + "\n");
console.log(`   ${stats.contributions} contributions · ${stats.repos} repos · ${stats.stars} stars · ${stats.followers} followers · best day ${best} on ${bestDate}`);
' /tmp/mirkashi-graphql.json /tmp/mirkashi-langs-owner.json /tmp/mirkashi-langs-studio.json "$FOLLOWERS" "$OUT"

echo "✓ wrote $OUT"
