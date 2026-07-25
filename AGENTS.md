# AGENTS.md

Guidance for AI agents working in this repo. Read this first.

## What this is

A single-page weather app (Next.js App Router). It shows current conditions +
a 5-day forecast over an animated, weather-specific background (clear, clouds,
rain, drizzle, snow, thunderstorm, fog/atmosphere), with day/night variants,
sunrise/sunset colors, and a monochrome mode.

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

Each top-level area has its own `AGENTS.md` with a navigation map + directory
gotchas — consult the child file when working in that directory:

- `app/` → [`app/AGENTS.md`](./app/AGENTS.md) — `page.tsx` (the whole app),
  `layout.tsx`, `globals.css`.
- `components/` → [`components/AGENTS.md`](./components/AGENTS.md) —
  `background.tsx` router + solar palettes, `backgrounds/*` families, animated
  SVG primitives, foreground UI, `settings.tsx`.
- `pages/api/` → [`pages/api/AGENTS.md`](./pages/api/AGENTS.md) — the
  server-side proxy routes (the only backend).
- `homeassistant/` → [`homeassistant/AGENTS.md`](./homeassistant/AGENTS.md) —
  the HA add-on packaging (Docker / nginx / bash).
- `custom_components/weather_app/` →
  [`custom_components/weather_app/AGENTS.md`](./custom_components/weather_app/AGENTS.md)
  — the companion HACS integration.

Directories without their own file (covered here):

- `constants/data.ts` — `fakeWeather` fixtures for the spoof-weather feature
  (note: stale 2024 sunrise/sunset timestamps).
- `types/index.ts` — shared types. `lib/utils.ts`, `hooks/` — pure helpers.

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
npm test          # vitest run  (125 tests, 12 files)
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
- `test/components/weatherAppCard.test.ts` — regression test for the HA
  integration's `custom_components/weather_app/weather-app-card.js` per-user
  monochrome-after-reboot fix (imports the card module for its side effect to
  register the custom element; recovery reload must refresh the ingress URL +
  require a valid session before loading).

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
- **Fake Time:** a frozen, session-only `HH:mm` preview. It drives the clock,
  day/night art, weather icon, and solar colors without changing API/cache
  time. Clear it to return to live time. While set, it replaces the spoofed
  weather `Is Night` control.
- **Play Day:** runs fake time from the selected fake time (2:00 AM by default)
  to 10:00 PM in five-minute visual steps. Playback Speed offers Slow (2
  minutes), Medium (60 seconds, default), and Fast (30 seconds). The modal
  closes while it plays; reopen Settings to stop it. **Reset to Live** stops
  playback, clears fake time, and restores actual weather. Preview state
  remains session-only.
- **Color Mode:** Settings → "Color Mode" → Color / Monochrome.
- The MT Select triggers are `<button role="combobox">`; options are `<li>`.

## Solar transition colors

- The colored dashboard blends indigo/violet through rose/gold around sunrise,
  and rose/coral/peach into violet around sunset. It uses effective Sun2 times,
  then provider fallback.
- Each ramp starts 90 minutes before its event, peaks around the event, and
  fades out 65 minutes afterward. Live mode updates every 30 seconds.
- Each weather family inherits `--solar-transition-gradient`, so the gradient
  sits behind clouds/precipitation instead of washing out foreground art.
- `--scene-night-strength` continuously blends scene brightness through both
  sunrise and sunset; do not reintroduce exact-minute night/day background swaps.
- Cloud translucency follows sunset only. Applying it during sunrise makes the
  visible clouds fade before the sky brightens, producing a false predawn dip.
- Monochrome sets the gradient to `none` at the source; the root
  `grayscale(1)` filter remains a second no-hue guarantee.

## Monochrome mode (how it works)

- `mono=1` URL param → `mono` state. `Background` always renders the **night**
  variant when mono is on (night art is already grayscale).
- Mono always applies `html.invert { filter: invert(1) grayscale(1) }`, producing
  the eink-friendly white background with dark elements for both day and night.
- Day/night still changes the clear-weather Sun/Moon and foreground weather
  icon. `Background` passes `inverted = mono` to Sun/Moon/Atmosphere so their
  source gray survives the root inversion.
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
