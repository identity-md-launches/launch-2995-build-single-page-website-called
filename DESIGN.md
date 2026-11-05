# Squeek Pulse design system

## Overview

Squeek Pulse is a reading-first dashboard for people following Squeekchain's wheel telemetry and community. A charcoal and olive instrument panel uses warm orange for the main action and an original hamster-wheel drawing as its single product illustration. Values come before explanation: wheel and confirmed block progress, four totals, then rankings and the wheel-to-chain explanation.

The source of truth is `src/styles.css`, with markup and state in `src/main.ts`, and reusable SVGs in `src/icons.ts`. The palette and layout are implementation choices inferred from the brief's dark-theme requirement.

## Colors

Canonical tokens are hex values in `src/styles.css:9`. Use semantic tokens for new components.

| Token | Value | Role |
| --- | --- | --- |
| `--color-page` | `#111312` | Page and header background |
| `--color-surface` | `#1a1d19` | Dashboard panels and dialog |
| `--color-surface-hover` | `#252b22` | Neutral interactive and stale-state surfaces |
| `--color-border` | `#30362d` | Panel/control structure, progress track |
| `--color-divider` | `#2a3027` | Table and panel separators |
| `--color-text` | `#f0f1e9` | Primary text and numbers |
| `--color-muted` | `#a2a99a` | Captions and secondary labels |
| `--color-soft` | `#c5ccbc` | Supporting text and section labels |
| `--color-accent` | `#ffad74` | Refresh fill, block progress, brand details |
| `--color-accent-hover` | `#ffc093` | Refresh hover/pending background |
| `--color-on-accent` | `#211e17` | Text on the orange primary button |
| `--color-positive` | `#b6d391` | Connected/running state and enabled switch |
| `--color-positive-bg` | `#293520` | SPINNING status background |
| `--color-warning` | `#efc27f` | IDLE and delayed/unavailable notices |
| `--color-warning-bg` | `#342c20` | Warning and IDLE backgrounds |
| `--color-focus` | `#ffbd8d` | Keyboard focus perimeter |

The explainer uses `#1c241a`; table headers use `#1d211b`. Podium ranks and initials use the small local category palettes in `.podium-*` and `.avatar-*`. These distinguish data rows rather than actions. Illustration colors are local SVG fills, not extra UI themes. Status always includes text as well as color.

Rendered measurements from taste@1: primary values on the panel **14.97:1**, muted wheel description on the panel **7.03:1**, IDLE label **8.31:1**, and Refresh label on its orange fill **9.09:1**. The measurement report is in `artifacts/taste-checks.json`; all measured text passed 4.5:1, or 3:1 for large type. This is not a claim about every possible third-party identity or OS high-contrast configuration.

## Typography

The local variable **Manrope** font is `public/fonts/manrope-latin.woff2`, with fallbacks `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. Available CSS weights are 400–600; the UI uses only **400, 500, 600**. It loads with `font-display: swap`, has a preload in `index.html`, and is bundled once into `dist/fonts/`. The font license travels with it.

| Token | Size at default root | Role |
| --- | --- | --- |
| `--text-xs` | 12px / `.75rem` | Captions, status, compact mobile table |
| `--text-sm` | 14px / `.875rem` | Body, actions, table cells |
| `--text-base` | 16px / `1rem` | Panel headings and mobile wheel headline |
| `--text-lg` | 20px / `1.25rem` | Brand, wheel headline, leaderboard heading |
| `--text-heading` | 32px / `2rem` | Page heading, metrics, explainer title |
| `--text-display` | 48px / `3rem` | RPM and block height |

Body line-height is 1.6; headings are 1.25–1.5; large values are 1.25. Body tracking is natural. Page and metric headings use `-.04em`; 48px numbers use `-.055em`; small headings stay between `0` and `-.03em`. `.numeric` applies tabular numbers. Body and labels remain proportional, with no monospace prose or tracked capitals. SPINNING, IDLE, and RPM preserve the requested data terms.

Critical values wrap instead of being clipped or ellipsized. Member names use `overflow-wrap: anywhere`; large block labels and table headers also wrap. Explanatory copy uses short measures, typically 26–36 characters. The final probe observed six sizes, one family, and three weights at both mobile and desktop widths.

## Layout

The spacing scale is 4, 8, 12, 16, 24, 32, and 48px (`--space-1` through `--space-7`). Panel-specific 20/28px padding refines the compact dashboard. Related labels and values sit closer than adjacent sections. Header and main share a **1296px maximum width including padding**. Desktop margins are 24px; mobile margins are 20px, dropping to 16px at 352px and below.

Desktop `.network-grid` uses `1.45fr 1fr` for wheel and blocks. `.metrics-grid` has four equal columns. `.community-grid` uses `1.9fr 1fr` for the table and explanatory aside. Content stays in document order and the header is not sticky.

| Breakpoint | Implemented behavior |
| --- | --- |
| `66rem` / 1056px | Compact navigation and panel padding; footer stacks |
| `53rem` / 848px | Page actions move below heading; metrics become two columns; leaderboard and explainer stack; explainer briefly uses two internal columns |
| `38rem` / 608px | Header navigation hides; utility link remains; network panels stack; wheel uses a wrapping flex layout; avatars hide while usernames remain; compact table and single-column explainer |
| `22rem` / 352px | 16px page margins, compact metric numbers and table padding, source rows stack |

On phones, metrics use `auto-fit` with a minimum of `min(100%, 8.5rem)`: two columns normally, one when enlarged text needs the space. Refresh controls and wheel contents wrap rather than forcing a fixed width. Tables keep all four data columns; names and headers wrap. At 390 × 844 the title, Refresh, auto-refresh, wheel state, and RPM are on the first screen. Browser checks covered 320, 390, 768, 1024, and 1440px, plus 200% CSS text enlargement and RTL reflow. Native browser zoom and physical devices were not checked.

## Elevation & Depth

The interface is flat. Panels use a one-pixel structural border with no box shadow. Separators define table rows and panel footers. The explainer has a tonal background without another nested card. The illustration's floor is part of the SVG art. The native dialog occupies the browser top layer, with a `rgb(0 0 0 / 75%)` backdrop; no custom fixed overlay/focus trap is implemented.

## Shapes

`--radius-panel` is 16px; `--radius-control` is 8px. Status labels and podium rank marks use 6px radii. Initials have a 10px radius. Switch tracks and dots are circular. Border radii never clip meaningful text; only decorative geometry and the progress fill are clipped.

## Components

These are native DOM/CSS patterns, not a component-library API.

| Pattern | Source / use | States and behavior |
| --- | --- | --- |
| `.button`, `.button-primary`, `.button-secondary` | `src/styles.css:100`; Refresh and retry | 44px minimum height; one orange primary action; hover, active, disabled/loading, visible focus |
| `.auto-control` | `src/main.ts`; labeled checkbox with switch treatment | Native Space/keyboard toggle; pauses scheduling; manual Refresh remains available; visible focus on track |
| `.panel`, `.section-label` | Dashboard sections | Flat bordered container, shared heading/icon alignment |
| Wheel panel | `renderStatus()` in `src/main.ts`, `hamsterWheel` in `src/icons.ts` | SPINNING/IDLE/unknown/loading/unavailable; fresh state controls motion; delayed values are explicitly labeled |
| Block progress | Native `<progress>` | Confirmed anchor, labeled percentage and adjacent block numbers; no invented zero for missing data |
| Metric panel | `.metric-panel` | Label, tabular value, short caption; responsive intrinsic width |
| Rankings | `renderRankings()` in `src/main.ts` | Semantic table; top ten by rank; loading, empty, retained stale data, retry, success; remote strings use `textContent` |
| Source dialog | Native `<dialog>` | Open from table/footer; initial focus on Close; Escape dismisses; native background inertness and focus return |
| Notices and announcements | `.notice`, `#announcement` | Persistent recovery instructions; polite announcements for user actions; no once-per-second live-region chatter |
| Icons | `icon(name)` in `src/icons.ts` | One local outlined SVG set, 1.7px stroke and `currentColor`; decorative icons are hidden from accessibility APIs |

All visible primary controls have distinct shapes and 44px targets. Member links are compact but spaced in separate table rows. The focus ring is 2px with 4px offset; the checkbox track has the same visible treatment. Browser keyboard checks covered navigation, toggle, Refresh, dialog links, Escape, and focus restoration. Screen-reader announcement delivery remains unverified.

Motion is inside `prefers-reduced-motion: no-preference`. Button feedback lasts 150ms, with `scale(.96)` on press and `cubic-bezier(.2,0,0,1)` for transforms. The fresh running wheel uses a six-second rotation; the Refresh icon rotates while a request is pending. Both have static text cues. There is a separate Pause motion control when the wheel is spinning, and pausing auto-refresh also stops wheel motion. No entrance choreography or theme switching exists.

## Do's and Don'ts

- Start another dashboard section with the existing width, spacing, `.panel`, heading, and numeric patterns. Keep new values tied to a named source and show unavailable data explicitly.
- Use the orange filled button for the view's primary action. Reuse neutral secondary controls and the semantic status colors for other jobs.
- Keep the six-size scale, three weights, and local font. Use tabular numbers for changing values.
- Preserve real values and readable usernames. Let them wrap instead of clipping, shrinking critical text, or inventing sample values.
- Keep the hamster illustration as the visual signature. Extra gradients, glowing borders, nested cards, and font families conflict with this implementation.
- For another page, reuse the header and shell, build sections from these patterns, add hash navigation, and check first-screen action visibility, keyboard paths, stale/error states, and the five validated widths.

Guidance attribution and licenses are retained in `artifacts/NOTICE.md` and `artifacts/design-guidance-LICENSE.txt`.
