# Squeek Pulse

A single-page, dark dashboard for the hamster-powered Squeekchain network. It reads the public APIs directly, refreshes every 20 seconds, and includes the finished static site in **`dist/`**.

## Run locally

Requires Node.js 20.19+ within 20.x, or 22.12+, and npm. No credentials, environment files, wallet, or backend are needed.

```sh
npm ci
npm run dev
```

To rebuild and preview the production export:

```sh
npm run typecheck
npm run build
npm run preview
```

Vite prints the local URL (normally `http://localhost:4173` for preview). Serve **the contents of `dist/`** with any static HTTP server. Vite's `base: './'`, relative asset references, and hash navigation support hosting at a subpath. Opening the file directly with `file://` is not supported by browser module security rules.

The committed export is the delivery; a host does not have to install packages or rebuild it. Source changes require a new `npm run build` and inclusion of the resulting `dist/` files.

## What's included

- SPINNING / IDLE state, RPM, and an original illustrated hamster wheel. Motion follows fresh SPINNING readings, with a pause control and reduced-motion support.
- Confirmed block height, next-block progress, distance run, and latest settled round.
- Community members, badges earned, and the actual top 10 ranked by all-time Aura.
- Manual refresh, an auto-refresh checkbox, per-feed recovery, and an accessible source-details dialog.
- Responsive layouts, semantic tables, visible keyboard focus, a local font, favicon, and a 1200 × 630 share image.

## Data contract

| Feed | URL | Fields used |
| --- | --- | --- |
| Wheel and chain | `https://api.squeekchain.com/v1/status` | `measurement`, `builder.anchor` |
| Community | `https://community.squeekchain.com/v1/community/stats` | `members`, `badgesEarned`, `snapshot.computedAt` |
| Top 10 | `https://community.squeekchain.com/v1/community/leaderboard?limit=10` | `entries`, `snapshot.computedAt` |

The two assigned endpoints were inspected first. The community stats response has no rankings, so the working public leaderboard route on the same service supplies them. No sample leaderboard or fabricated live values are bundled into the app.

Mappings live in `src/api.ts`:

- RPM = `measurement.rpmMilli / 1,000`, displayed to one decimal.
- Kilometers = `measurement.distanceMm / 1,000,000`, displayed to three decimals. This is the hardware's reported counter, which can reset with a new counter epoch; the page does not invent a lifetime distance.
- Height = `builder.anchor.blockHeight`, preserving integer precision with `BigInt`. Optimistic/projected heights are excluded.
- Progress = `builder.anchor.blockProgress / 1,000,000,000 × 100`, displayed to one decimal with the native progress value retaining precision.
- Settled rounds = `builder.anchor.settledThroughRound`. This is the highest confirmed round number; the API does not supply an independently counted total of settled rounds. The card says “Through round #…” and the source dialog explains this distinction.
- Rankings are sorted by the API's `rank`, limited to 10, and show Aura and badges. X identities use their readable usernames; alias identities use their aliases. Initials are local decorative avatars, not downloaded profile photos.

Requests run in parallel with independent feed state and a 12-second timeout. The next automatic refresh is scheduled 20 seconds after completion, so requests do not overlap. Pausing stops automatic requests; manual Refresh still works. Paused and failed views retain their values in memory only. Reloading starts a fresh fetch.

A stale/offline hardware reading stops wheel motion and shows a warning. Freshness uses the API's observation time and stale threshold, with 60 seconds of future clock-skew tolerance. Community data is a snapshot, and its computation age is shown separately from fetch timing. Feed availability, browser connectivity/CORS, and a reasonably correct device clock affect live results.

## Validation

The production build and TypeScript check passed. Chromium interaction validation passed **12 groups**, and the pinned design probe passed **16/16 checks**. Tests serve the real `dist/` at `/preview/`; fixture responses are confined to tests. Live API loading and manual refresh were also checked separately. Full coverage, fixes, retained screenshots, and limitations are in [`artifacts/validation.md`](artifacts/validation.md).

Run the repeatable interaction checks after building:

```sh
npx playwright install chromium
npm run test:ui
```

Optional WebKit check, on a machine with its system libraries:

```sh
npx playwright install webkit
SQUEEK_TEST_BROWSER=webkit npm run test:ui
```

The test script manages its own temporary HTTP server and browser, then closes both. Reports and screenshots go to `test/scratch/validation/`. `SQUEEK_PLAYWRIGHT_MODULE` and `SQUEEK_AXE_MODULE` optionally select externally installed test modules. This worker used an external toolchain in the disposable scratch directory and the available Chromium executable because the managed browser launcher failed. WebKit could not launch because system libraries were missing. Physical devices, a screen reader, and native browser zoom remain untested; CSS text enlargement to 200% and RTL reflow were tested.

## Source and delivery layout

| Path | Purpose |
| --- | --- |
| `src/main.ts` | Dashboard markup, state, polling, accessible interactions |
| `src/api.ts` | Public endpoints, runtime validation, unit conversion, freshness |
| `src/icons.ts` | Local SVG icons and original hamster-wheel illustration |
| `src/styles.css` | Tokens, components, responsive and motion rules |
| `public/` | Local font and license, favicon, share image |
| `dist/` | Complete static production export, intentionally included |
| `tests/dashboard.mjs` | Production-export interaction and accessibility checks |
| `DESIGN.md` | Implemented design system and reuse guidance |
| `artifacts/` | Validation report, selected evidence, design-guide notices |

The frontend uses TypeScript and Vite with native DOM components; there are no runtime package dependencies. Test dependencies are development-only.

The explicit ignore-path budget is **0 submitted bytes** each for `**/node_modules/`, `**/.vite/`, `**/.cache/`, `**/.npm/`, and `test/scratch/`. These are generated dependencies/caches or disposable test evidence, at any applicable nesting level. Retained documentation and evidence under `artifacts/` have a separate **1 MiB maximum**. No runtime asset or `dist/` path is ignored. There is no vendored registry or dependency archive.

## Attribution

Manrope is bundled under the SIL Open Font License; see `public/fonts/OFL.txt`. Interface review applied Jakub Krehel's Better Interface (MIT) and the adapted documentation method from Paul Bakaus's Impeccable (Apache-2.0). Source references and retained license notices are in [`artifacts/NOTICE.md`](artifacts/NOTICE.md). Illustrations and interface icons were drawn for this site.
