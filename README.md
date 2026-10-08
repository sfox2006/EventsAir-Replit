# EventsAir dashboard demo

A runnable reconstruction of the inspected Home selector, L&S26 Conference and Consilium 2026 dashboards, and twelve top-level workspace pages. Built from the supplied October 8, 2026 handoff, with React, TypeScript, Vite, React Router, plain CSS, Lucide, Recharts and an Express 5 production server.

This is a public fixture-based demo. It has no EventsAir API, database, login, AI service, payments, email, SMS or bulk operations. Access Rights stores a local preference and does **not** secure the application. Uninspected workflows open an unavailable notice. No actual contacts, sender identities or credentials are bundled.

## Run locally

Use **Node 22.12+ within 22.x**, npm and the existing repository checkout. No secrets or `.env` file are needed.

```sh
npm ci
npm run typecheck
npm test
npm run build
npm start
```

Express binds to `0.0.0.0`, port 3000 by default. Visit `/event/selection` and `/event/consilium26/dashboard` on your local server. `GET /health` returns `{"status":"ok"}`. Nested HTML routes support direct reload; unknown assets and `/api` routes return 404.

Optional editing server: `npm run dev`. Stop Express first; both use port 3000. Production always uses Express, never Vite preview. `npm start` resolves `dist` independently of your shell working directory and fails clearly if the build is missing or PORT is invalid.

## Configuration and persistence

`.env.example` contains only public settings:

- `PORT=3000`: runtime Express port, validated as an integer from 1 to 65535.
- `VITE_REFERENCE_DATE=2026-10-09`: public build-time date, also the default without configuration. Set to `live` and rebuild for the current calendar date in each event's IANA timezone. Other values must be real YYYY-MM-DD dates. Never put credentials in `VITE_*` settings.

The frozen clock yields Consilium's “6 days to go” and L&S26's “Ended 138 days ago.” New events default to the reference date and next day, rather than the source's October 8–9 observation. The demo info footer explains the clock and contains a confirmed Reset demo action.

Events, favorites, Home sort, widget layout/names/filters, named contact-filter presets and the New Event help preference use versioned localStorage (`eventsair-demo-v1`). Each browser/origin has independent state. Blocked storage uses memory with a notice; corrupt/unsupported records recover to fixtures. Refresh rereads this local store and preserves widgets and their filters. There is no polling. Search, period, filter and page state are transient; changing them resets pagination. Form/filter Cancel discards drafts, and Save/Apply commits explicitly. Reset restores all fixtures.

## Evidence and chosen demo behavior

- The seven Home labels, start dates, locations, displayed durations and sole L&S26 favorite are observed. Only L&S26 and Consilium end dates were opened; the other five end dates are inferred. The duplicated Jamison Street location and “0 day” are retained. Home Alerts remain blank.
- Consilium timezone Australia/Brisbane and aggregate counts (90 contacts, 0 registrations, 41 sessions) are event-scoped assistant reports. L&S26 reports are separately scoped (63 contacts, 0 registrations, 10 sessions); these are not independent database verification. L&S26 has no copied personal contact fixture, and its original Attendees query/settled total is unverified.
- Consilium's 90 identities, alternating Demo/Sample first-name groups and attributes are fictional. Emails use `example.invalid`. Creation dates preserve the assistant-reported candidate buckets: May 11/14/18/22/24/28 = 6/7/3/21/7/1, June 15/17/18/21/22 = 7/3/4/1/30. Cumulative totals end at 90. The native Contacts chart formula, source timestamp timezone basis, implicit scope and status exclusions are **unverified**. Chart smoothing/tooltips and filtered counts are deliberate demo behavior.
- Contacts and registrations are distinct. No attendee or financial KPI is inferred from Home rows. L&S26 empty accounting arrays use integer cents with revenue minus expenses; other events show no financial fixture. Original tax/currency/accounting rules are unknown.
- Duration is end ordinal minus start ordinal (no inclusive extra day). Countdown uses calendar-day ordinals. “In progress” is a chosen state.
- Home search is Enter-applied, trimmed, case-insensitive name substring matching. Periods select start dates. Default favorites lead seed order; period defaults use start date after favorites. Explicit sort overrides favorites. Page size is 50. These rules are chosen interpretations, not verified source algorithms.
- Contact filters AND active predicates, OR within multiselect groups, use inclusive date and case-insensitive lexicographic ranges, and require all selected blank fields to be blank. Null cannot satisfy an active predicate. Inactive/incomplete are excluded by default; dependent fields only apply when enabled. These predicates are a demo engine. Only Contact Details is implemented; other categories/tabs explicitly disclose unavailable rules. Presets and duplicate widgets are independent local demo state.
- Clone copies local preferences, modules and location; excludes ID/name/alias/dates/contact records. Validation requires name, valid ordered dates, unique local alias if supplied and nonnegative integer expected attendees. Module toggles store preferences without hiding navigation. Original catalogs, required asterisks, cloning and access enforcement were not established.
- L&S26 agenda uses the provided observed titles/times/descriptions, including overlapping Friday entries. Read-only details are a demo choice. Other events have no agenda fixture.
- Links preserve observed labels/URL attributes, but destinations were not opened or verified. Green checks mean only “source displayed a check mark.” User-clicked links open with noopener/noreferrer; copy handles permission failure. No automated external browsing occurs.
- Attendee pins/recents/column visibility, Online label search/sort and Show Agenda navigation are local demo choices. Reports, site editors, exports, setup pages beyond Preferences, communication sending, bulk/financial actions and unknown widget formulas remain unavailable.
- Outfit is locally bundled under SIL OFL 1.1; license at `public/licenses/outfit.txt`, copied into the production bundle. The geometric brand mark and faint Home planning symbols are original approximations. Lucide provides outline icons. Responsive one-column cards, scrollable rail/tables and modal layout are demo adaptations; exact parity with unprovided nested-page screenshots is not established.
- Incidental assistant promotional tour and satisfaction survey are omitted. Help is a local approximation; no support SDK/messages are connected. Assistant explains the separate event-scoped external service without connecting it.

A shared production backend, authentication, roles, business rules, survey submission logic, integrations and site publishing require a separate specification. This project does not promise full EventsAir feature parity.

## Replit import and deployment

Source, package-lock.json and `.replit` live at repository root. Import the existing repository through Replit's GitHub import flow (`https://replit.com/import`). Preserve the current origin and history; no new repository is needed.

`.replit` uses `nodejs-22`, stable-24_11, a single local port 3000 mapped to external port 80, and Run command `npm run replit:start` (locked install → build → Express). If import creates an overriding Run workflow, set that workflow to this command. Do not add another exposed port or conflicting Node package in replit.nix.

For public hosting, review Replit Publishing settings and choose Autoscale/Public with an available `.replit.app` domain:

```text
Build: npm ci && npm run build
Run: npm start
Access: Public
Internal port: 3000 (unless the platform supplies PORT)
Required secrets: none
```

After publishing, verify `/health`, Home and a hard refresh of a nested dashboard in a fresh browser. Preview is not publication. Replit account/resource/billing requirements and current UI labels must be checked there; import and deployment were not performed in this cloud task. Later GitHub updates require pulling, rebuilding, checking and republishing; automatic redeployment is not assumed.

Publish only when explicitly authorized. Review source/configuration before future commits; keep `.env`, dependencies and generated output excluded. The generated lockfile is intended to be tracked alongside package.json.

Official references: [Replit configuration](https://docs.replit.com/features/project-setup/configuration), [ports](https://docs.replit.com/features/project-setup/ports), [publishing](https://docs.replit.com/features/publishing/overview), [GitHub import](https://docs.replit.com/build/import-from-providers).

## Troubleshooting

- Wrong Node: use Node 22.12+ within 22.x. This cloud instance has a workspace-local Node 22.22.0; prepend `/workspace/eventsair-tools/node_modules/.bin` to PATH for commands here.
- npm cache permissions in this cloud instance: set `npm_config_cache=/workspace/.npm`.
- Lockfile mismatch: investigate package.json/lockfile disagreement; do not delete the lockfile to hide it.
- Missing dist: run the build and resolve its actual error.
- Port in use: stop the previous server you started before launching another.
- Unexpected counts: use Reset demo and check browser-local edits and the build-time reference date.
- Vite host rejection (optional dev only): Vite permits the exact REPLIT_DEV_DOMAIN if set, without globally disabling validation.

## Verification performed

- Repeated frozen `npm ci`, `npm run typecheck` through build, `npm test`: **16 tests passed in 3 files**. Covers dates/timezones/countdowns, invalid/reversed dates, combined/inclusive filters, ordering, pagination and filtered candidate contact history.
- Production build and Express startup passed; health and direct Home/dashboard HTML requests returned 200. Unknown API/assets and non-HTML fallback requests returned 404.
- Chromium smoke checks passed for seven rows/sole favorite, Consilium search/filter = 2, September = 1, year 2026 = 7, explicit name sorting and reload persistence, empty count reset, canceled/saved event drafts across tabs, widget layouts, 90→45 filtered contacts, independent duplicate filters, rename Escape/commit, refresh and persistence, favorite sync, copy failure feedback, all workspace routes, existing preference draft/disabled fields, 404 and Reset demo.
- Desktop 1440×1000 and narrow 444×875 screenshots were inspected; Home/dashboard fit viewport with internal table scrolling. Native modal Escape and nested-route reload were exercised.
- Corrupt/unsupported and blocked localStorage smoke checks passed. Real Replit import, deployment, external links, screen-reader testing, exhaustive keyboard paths and exact original-page visual parity remain unverified.
- Vite reports a nonblocking initial bundle size warning (~678 KB minified, ~205 KB gzip) including chart dependencies.

### Pre-push validation (October 8, 2026)

The completed source was validated under Node 22.22.0 with `npm ci`, `npm run typecheck`, `npm test` (16 passing tests), and `npm run build`. Both `npm start` and `npm run replit:start` were exercised. Local production health returned `{"status":"ok"}` and the socket bound to `0.0.0.0:3000`. Chromium verified seven Home records, Consilium search returning two, and direct loading and reloading of the dashboard with 90 fictional contacts. No Replit deployment or publication was performed.
