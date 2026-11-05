# Squeek Pulse validation

Reviewed on 2026-11-05 against the final production export in `dist/`. This is the worker's local evidence, not an independent certification.

| Area | Final result |
| --- | --- |
| Assignment acceptance criteria | 7/7 met |
| Known broken primary interactions | 0 |
| Product and main action on first screen at 390px | Yes |
| taste@1 | 16/16 passed |
| Interaction validation | 12/12 groups passed |
| Automated accessibility | 0 violations at five widths and in the source dialog |
| Share metadata | Title, description, favicon, og:title, and real 1200 × 630 og:image |
| Remaining copy findings | 0 |

## Scope and assumptions

One page, native TypeScript components, Vite static export, dark theme, and public read-only APIs. The visual idea is an olive-charcoal instrument panel built around a warm illustrated hamster wheel. The live readings are the product; explanatory material sits after the values and leaderboard.

The status and community endpoints both returned HTTP 200 with public CORS headers. The stats endpoint does not contain leaderboard rows. A working public `/v1/community/leaderboard?limit=10` endpoint on the same community service supplies actual rankings. The app has no seeded users or fallback live metrics. Test fixtures are confined to `tests/dashboard.mjs` and browser request interception during validation.

Confirmed `builder.anchor` values are used instead of optimistic projections. “Settled rounds” shows `settledThroughRound`, explicitly labeled “Through round #…”, because the API does not provide a separately counted total. Distance is the hardware counter in kilometers; it may reset with the counter epoch. The source dialog and README explain both meanings. Last-known values are retained only in memory and remain accompanied by a failure warning.

## Acceptance coverage

| Requirement | Evidence |
| --- | --- |
| “a usable website exists with working primary interactions and responsive layouts” | Manual refresh, 20-second scheduling, pause/resume, source dialog, hash navigation, retry, partial errors, empty states, and reflow tested on the export |
| “dist/index.html and its assets … alongside the source and lockfile” | Complete `dist/`, source, `package.json`, and `package-lock.json` included; `/preview/` hosting test resolves assets and metadata |
| “production build, typecheck and useful interaction validation … actual results and limitations” | Commands and outcomes below; preserved results JSON; limitations explicitly listed |
| “Better Interface … six domains … fixes … coverage, findings and limitations” | All six pinned core domains read and applied; consolidated coverage and resolved findings below |
| “first screen at 390 … product and its main action … title, favicon, description, og:title and og:image” | `screenshots/mobile.png`; metadata probe and actual image resource check |
| “DESIGN.md … tokens, typography, components and responsive behavior” | Root `DESIGN.md`, extracted from the final CSS/markup and checked against rendered evidence |
| “README explains how to install, preview and rebuild” | Root `README.md`, with normal npm commands and repeatable integration checks |

All requested data surfaces are present: SPINNING/IDLE with RPM, block height and native progress bar, distance, settled rounds, member count, badge count, top ten leaderboard, dark theme, responsive layout, and automatic 20-second refresh. SPINNING and stale/unknown states were validated with explicit test fixtures; the live feed was IDLE during retained live screenshots.

## Six-domain review

| Domain | Coverage and evidence | Unperformed / not applicable |
| --- | --- | --- |
| Accessibility | Checked native button/link/checkbox/dialog semantics, table headings/caption, accessible names, decorative SVGs, skip link, keyboard navigation, Space toggle, dialog focus and Escape return. Visible Refresh focus inspected. Axe WCAG 2 A/AA, 2.1 AA, and 2.2 AA scans returned zero violations at 320, 390, 768, 1024, 1440 and in the open dialog. Freshness and motion never carry state alone. | No screen-reader session or physical device. Forced-colors CSS reviewed in source, not rendered. No forms, payments, wallet, or destructive actions in scope. |
| Layout | Inspected the production export at desktop, phone, and intermediate sizes. No horizontal overflow at the five widths. Probe found no text overlap, clipped text, or floating control covering text at its three widths. Long names and 30-digit block numbers tested. 200% CSS text enlargement and RTL reflow checked. | Native browser zoom is not equivalent to the performed text enlargement and remains untested. Not every possible viewport or localization was checked. |
| Writing | Checked visible labels against their handlers, consistent Refresh vocabulary, truthful delayed/failure copy, empty rankings, source provenance, snapshot age, counter semantics, and fresh versus received timestamps. Errors give a recovery action. The first phone screen contains 19 prose words. | The interface is English only. No translated copy was requested. |
| Typography | Checked the final six-size scale, three weights, one loaded local Manrope family, tabular values, readable usernames, and wrapping at the supported widths. Long values preserve all digits. | Full multilingual font coverage is not claimed; the bundled face is the Latin subset with system fallbacks. |
| Colors | Measured rendered text/background pairs with taste@1 and axe. Example ratios: primary panel values 14.97:1, muted wheel caption 7.03:1, IDLE label 8.31:1, Refresh label 9.09:1. Focus-token contrast computed against page/panel/hover surfaces: 11.47:1, 10.47:1, 8.92:1. | Light theme is not applicable. Artwork contrast is decorative and is not presented as text contrast. Physical display and OS high-contrast behavior untested. |
| UI details | Checked flat borders, no border-plus-shadow or nested cards, icon consistency, loading/disabled/empty/error states, hover/focus/press rules, interruptible 150ms feedback, explicit motion pause, and reduced-motion behavior. Test fixtures verify fresh SPINNING, IDLE, stale and unknown states. | Animations were not replayed in a native DevTools Animations panel at 10% speed. Safari/WebKit was unavailable as described below. |

## Findings and corrections

All findings below are resolved in the final source and export.

1. **High — accessibility/layout: enlarged text could push Refresh outside the viewport.** `src/styles.css:91`, `.refresh-controls`; `src/styles.css:173`, table headers; `src/styles.css:317` and `:332`, mobile wheel and metric layout. At 390px with the root font enlarged from 16px to 32px, Refresh's right edge reached 423px, and fixed table columns became cramped. Added wrapping controls, intrinsically wrapping wheel contents, auto-fit metric columns, and breakable headers. Rechecked 200% text enlargement with no document overflow; ordinary 320/390 layouts and the first-screen probe still pass.

2. **Medium — layout: very long block labels overflowed the progress row.** `src/styles.css:153`, `.block-range > span`. At 320px, a 30-digit test height pushed `#next-block`'s right edge to 519px. Added zero minimum width, 48% maximum width, and `overflow-wrap: anywhere` while preserving every digit. Rechecked the same long value at all five widths: no horizontal overflow.

3. **Medium — UI: refresh timing could drift by a display tick.** `src/main.ts:151`, `scheduleRefresh()`. The initial one-second display loop could start a request up to one second after its 20-second deadline. Replaced fetch scheduling with an independent timeout, reset after completion or pause/resume, while keeping the countdown loop separate. The clock-controlled test verifies no request at 19 seconds, one new batch at 20 seconds, pause, manual refresh while paused, resume, and no overlap on a slow request.

4. **Medium — writing: successful fetching did not prove freshness.** `src/main.ts:328`, manual completion announcement, and `src/main.ts:124`, source explanation. Replaced “All three feeds are up to date” with **“All three feeds responded.”** Moved settled-round semantics under the status feed and clarified that distance can reset and community computation can lag. Source review and the rebuilt source dialog confirm the final wording.

5. **Low — UI/performance: the local font was packaged twice.** `src/styles.css:3`, font URL. Importing the public font as a bundled source asset created both a hashed copy and the public copy. Switched to Vite's public-asset reference, emitted as `../fonts/manrope-latin.woff2` in the production CSS. The final export contains one font binary, and live browser validation confirms that it loads with no missing resources.

No unresolved high or medium findings remain within the implemented scope. The probe reports ten compact member links below its 44px comfort target; it confirms they meet the 24px-or-spacing requirement. Primary buttons, the switch label, source control, and dialog close control use comfortable targets. No primary action is hidden or clipped.

## Commands and actual outcomes

The worker installed tooling inside disposable `test/scratch/` rather than creating repository `node_modules/`. The source manifest and lockfile support the normal README installation flow.

| Check | Actual command / setup | Result |
| --- | --- | --- |
| TypeScript | `PATH="$PWD/test/scratch/toolchain/node_modules/.bin:$PATH" npm run typecheck` | Exit 0, `tsc --noEmit` |
| Production export | Same PATH prefix, `npm run build` | Exit 0, Vite 7.3.1; six modules transformed; relative JS/CSS and local assets emitted |
| Interaction suite | `npm run test:ui`, with `SQUEEK_PLAYWRIGHT_MODULE` selecting the scratch Chromium adapter and `SQUEEK_AXE_MODULE` selecting the installed axe module | Exit 0, 12 integration groups passed; [`interaction-checks.json`](interaction-checks.json) |
| Design probe | `node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste`, with `IMD_PLAYWRIGHT` selecting the same adapter and `TMPDIR=/tmp` | Exit 0; all 16 passed at 320, 390, 1440; [`taste-checks.json`](taste-checks.json) |
| Live production smoke | `TMPDIR=/tmp node test/scratch/live.mjs`; actual export served under `/preview/` inside the foreground script | Exit 0; initial load and manual refresh each fetched all three named public feeds with HTTP 200; all metrics and 10 actual rows present; [`live-check.json`](live-check.json) |
| Accessibility | Axe run by the production interaction suite | Zero violations at all five widths; [`axe-checks.json`](axe-checks.json); dialog also asserted clean in the suite |
| WebKit attempt | Downloaded WebKit and ran `SQUEEK_TEST_BROWSER=webkit npm run test:ui` with its scratch browser location | Exit 1 before page creation: host missing GTK/GStreamer and other WebKit system libraries; no WebKit result claimed |

The managed browser tool also failed at startup with a Chromium socket-path-length error. A standalone Playwright session using the available headless Chromium executable provided actual rendering, screenshots, live network checks, and interactions. The adapter only selects the executable and normal network proxy; it does not modify the product, test assertions, or pinned probe. `/tmp` had to be created in each foreground command because this sandbox resets it. These are validation-environment limitations, not requirements for the static site.

Negative interaction cases intentionally return HTTP 503, invalid measurements, empty rankings, delayed requests, and stale readings. Expected failures remain visible and recoverable; no unexpected JavaScript exception or missing local file was observed. Live smoke validation recorded zero console/resource failures. Tests use a virtual clock for polling; timeout recovery also exercised the browser's native abort timeout.

## Retained evidence

- [390 × 844 first screen, live data](screenshots/mobile.png): product, Refresh, auto-refresh, IDLE/RPM, and wheel are visible.
- [390px full page, live data](screenshots/mobile-full.png): all metrics, rankings, and footer reflow vertically.
- [1440px full page, live data](screenshots/desktop.png): full dashboard composition and actual community rankings.
- [Keyboard focus, isolated SPINNING test fixture](screenshots/keyboard-focus.png): visible focus perimeter on Refresh; fixture values are not used by the live site.
- JSON records above retain measured probe output and completed integration groups. Additional intermediate screenshots and raw audits stayed under `test/scratch/` and are intentionally not delivered.

## Completion and limits

**Complete for the stated scope.** The complete static export, source, lockfile, README, implemented design document, and validation evidence are included. The submission audit found 35 files, a 166,819-byte production export, and approximately 1.0 MiB total against the 8 MiB limit. Generated dependencies, browser downloads, caches, and disposable tests are excluded. `artifacts/` uses approximately 0.60 MiB of its documented 1 MiB budget; excluded generated paths each have a zero-byte submission budget. Manifest and lockfile dependencies/engines match, and no submodule, symlink, prohibited configuration path, or dependency archive was added.

Live values depend on public API availability, CORS, snapshot computation, and the visitor's device clock. There is no backend, persistence, fabricated offline dataset, or full accessibility certification. Safari/WebKit, physical devices, screen-reader announcements, native browser zoom, and rendered forced-colors behavior remain unverified. Hosting/publishing is outside this assignment.
