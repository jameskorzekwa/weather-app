# AGENTS.md

Guidance for AI agents working in this repo. Read this first.

## What this is

A single-page weather app (Next.js App Router). It shows current conditions +
a 5-day forecast over an animated, weather-specific background (clear, clouds,
rain, drizzle, snow, thunderstorm, fog/atmosphere), with day/night variants and
a monochrome mode.

There is no backend. All config comes from URL query params; weather data is
fetched client-side.

## Tech stack (and version gotchas)

- **Next.js 16** (App Router, Turbopack), **React 19**
- **Tailwind CSS v4**
- **@material-tailwind/react v2** (MT) — built for Tailwind 3 / React 17–18, so
  there are compatibility shims (see Known Issues)
- **styled-components** for the animated SVG weather elements
- Node version pinned in `.nvmrc` (24.x)

## Project layout

- `app/page.tsx` — the whole app. `HomeContent` holds all state; wrapped in
  `<Suspense>` because it uses `useSearchParams()`. State is driven by URL
  params and synced back to the URL via `history.pushState`.
- `app/layout.tsx` — root layout. Rubik font via `next/font/google`. Inline
  `<script>` adds `mono-init`/`invert` classes to `<html>` before paint.
- `app/globals.css` — Tailwind import, MT compat shims, the mono/invert filter
  rules, splash styles.
- `components/background.tsx` — routes `current.id` (OpenWeatherMap-style code)
  to the right `components/backgrounds/*` component. Computes `night` and
  `inverted` flags here.
- `components/backgrounds/*` — one per weather family. Each takes `isNight` and
  sometimes `mono`/`inverted`.
- `components/sun.tsx`, `moon.tsx`, `cloud.tsx`, `raining.tsx`,
  `thunderCloud.tsx` — animated SVG primitives.
- `components/settings.tsx` — the MT `<Dialog>` config modal.
- `components/currentWeather.tsx`, `weeklyWeather.tsx`, `dateTime.tsx`,
  `alerts.tsx` — foreground UI.
- `constants/data.ts` — `fakeWeather` fixtures used by the spoof-weather feature.
- `types/index.ts` — shared types. `lib/utils.ts`, `hooks/` — helpers.

## Running the dev server

```bash
npm run dev    # next dev, http://localhost:3000
```

Notes:
- A dev server is often already running on port 3000 (started outside the
  agent session). If `npm run dev` fails with a `.next/dev/lock` error or
  "port in use", a server is already up — just use it; don't start a second.
- `npm run build` / `npm run start` for prod build.

## Tests

Vitest + React Testing Library (jsdom). Config: `vitest.config.ts`
(`@` alias → project root, `css:false`), setup: `vitest.setup.ts`
(jest-dom + matchMedia/ResizeObserver polyfills). Tests live in `test/**`.

```bash
npm test          # vitest run  (74 tests, 11 files)
npm run test:watch
npm run lint      # next lint
```

Coverage / conventions:
- `test/lib/utils.test.ts` — all pure functions. Tests lock in **actual**
  behavior, incl. quirks (`roundTo` uses bitwise `^`, `getTemp` uses 273 vs
  273.15) — don't "correct" the asserted values to match the math.
- `test/hooks` — `useRandomInterval` with `vi.useFakeTimers()`.
- `test/components/svg.test.tsx` — Sun/Moon/Cloud/Raining/ThunderCloud:
  assert SVG `fill`/structure (incl. the `inverted` grey-vs-color logic).
- `test/components/ui.test.tsx` — Loading/DateTime/CurrentWeather/WeeklyWeather.
- `test/components/background.test.tsx` — routing + `night`/`inverted`
  flags. Mocks every `backgrounds/*` child; **vi.mock factories are hoisted
  so they must be fully self-contained** (no outer-scope refs).
- `test/components/backgrounds.test.tsx` — real backgrounds, bg-color + sun/moon.
- `@material-tailwind/react` is mocked per-file (inputwrapper/alerts/settings)
  — MT v2 + portals/floating-ui don't render cleanly in jsdom.
- `test/api/routes.test.ts` — `pages/api/awn` & `switchbot` with
  `ambient-weather-api`/`fetch`/`uuid` mocked.
- `test/app/page.test.tsx` — smoke only (heavy children + `next/navigation`
  stubbed); asserts the loading splash mounts.

Known gotcha encoded in tests: `components/settings.tsx` `validate()` is
effectively a **no-op** — it runs validation inside an async `setForm`
updater but returns the stale `valid`, so Save never actually blocks. The
settings test asserts this real behavior (with a comment), so a future fix
will surface as a failing test.

Unit tests cover logic + render output. Animated weather backgrounds and
live API integration are still **manual browser testing** (see below) — if
you change UI, verify in the browser; don't claim success without looking.

## How to test in the browser

Use the Chrome MCP browser tools (`mcp__claude-in-chrome__*`). Load them via
ToolSearch first, create a tab with `tabs_context_mcp`, then `navigate`.

**Test URL:** the working URL with real API keys is in `test-url.local`
(gitignored — contains secrets, never commit it or paste its contents into
committed files/PRs/logs). It sets lat/lon, zipcode, Geoapify + AWN keys, and
`weatherSource`. Append `&mono=1` for monochrome.

Key interactions:
- **Settings modal:** there's an invisible 75×75 `<div>` (styled-component
  `SettingsWrapper`) at the top-left corner. Click ~`(30,30)` to open, or in
  JS: `document.querySelector('.sc-dYwGCk').click()`. (The generated class can
  change — prefer clicking the corner.)
- **Spoof weather:** Settings → "Select Current Weather" dropdown. Options:
  Thunderstorm, Rain, Drizzle, Snow, Clear, Fog, Clouds, plus "Actual Weather".
  spoofWeather is NOT in the URL — only settable via the modal. Save applies it.
- **Is Night:** appears in Settings only when a weather is spoofed. When NOT
  spoofing, `isNight` auto-detects from `current.sunrise/sunset` and overrides
  the manual toggle (the fixture sunrise/sunset are stale 2024 timestamps, so
  spoofed weather can read as night — set Is Night explicitly to control it).
- **Color Mode:** Settings → "Color Mode" → Color / Monochrome.
- The MT Select triggers are `<button role="combobox">`; options are `<li>`.

## Monochrome mode (how it works)

- `mono=1` URL param → `mono` state. `Background` always renders the **night**
  variant when mono is on (night art is already grayscale).
- Day vs night in mono is just the invert filter:
  - **mono day** = night render + `html.invert { filter: invert(1) }`
    (managed by a `useEffect` in `page.tsx`, set when `mono && !isNight`).
    Visually: white bg, dark elements.
  - **mono night** = night render, no filter. Black bg, light elements.
- `Background` passes `inverted = mono && !isNight` to Sun/Moon/Atmosphere so
  their source color is chosen to survive (or counter) the invert.
- Splash (`loading.tsx`) uses CSS classes; the inline script in `layout.tsx`
  sets `mono-init`/`invert` on `<html>` before first paint to avoid a flash.
- The filter is on `<html>`, NOT `<body>` — filtering body makes it a
  containing block for `position:fixed`, which broke the Next.js dev overlay.
- `html.invert nextjs-portal { filter: invert(1) }` counter-inverts the Next.js
  dev tools so it keeps its real colors.
- MT primary buttons have a blue `linear-gradient` background-image; in mono it
  is forced to solid black via
  `html.mono [role="dialog"] button:not([role="combobox"])` (the `:not` keeps
  Select triggers untouched).

## Known issues / gotchas

- **MT Dialog open animation is broken** under React 19 + Turbopack — the modal
  stays at `opacity:0 / translateY(-50px)`. `settings.tsx` has a
  `requestAnimationFrame` loop that force-sets `opacity:1; transform:none`
  while open, and releases on close so MT can still unmount it. Don't "fix" by
  deleting that effect.
- MT v2 emits Tailwind-3 utilities Tailwind 4 dropped (e.g. `bg-opacity-60`)
  and isn't scanned by default. `globals.css` has
  `@source "../node_modules/@material-tailwind/react"` and a
  `@utility bg-opacity-60` shim. Don't remove these or the modal/backdrop
  goes transparent.
- `components/settings.tsx`, `inputwrapper.tsx`, `alerts.tsx` have
  `// @ts-nocheck` for MT v2 / React 19 type mismatches.
- Weather backgrounds key off OpenWeatherMap condition codes (`current.id`),
  even when `weatherSource=OpenMeteo` (codes are mapped upstream).
- `.idea/` and `*.local` are gitignored. Never commit secrets — the real API
  keys live only in `test-url.local`.
