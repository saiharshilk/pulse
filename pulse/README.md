# PULSE

A personal iPhone app with a dark, data-dense, three-dial look, powered by a $20 Colmi R02 smart
ring. Until the real ring is connected (Prompt 5), it runs on realistic mock data generated on the phone.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with your iPhone camera to open the app in Expo Go.

```bash
npx tsc --noEmit   # typecheck
npx jest           # tests
npx expo-doctor    # project health
```

## Architecture

```
RingDataProvider (interface)
 ├─ MockRingProvider     used now, always available in Expo Go
 └─ ColmiRingProvider    stub until Prompt 5 (Bluetooth)
        │  raw readings (RingSyncBatch)
        ▼
syncService      drops 0-bpm readings, de-duplicates, saves to SQLite
        ▼
scoring engine   raw samples + profile → one DailySummary per day (pure functions)
        ▼
zustand store    summaries, selected day, device status
        ▼
screen hooks     format values into display strings → screens and components
```

- Providers return raw, ring-shaped data only: heart-rate readings and step buckets. Sleep and
  scores always come from the scoring engine, so the same pipeline runs with the real ring.
- Screens never call a provider. History flows through `syncService`; connection state, battery,
  live streams and ring commands go through `deviceManager`.
- Screens never format numbers. Each screen has a hook in `src/features/<screen>/`.

## How the data source works

`src/config/appConfig.ts` sets `DATA_SOURCE` (`'mock'` or `'ring'`, default `'mock'`), and
`getProvider()` in `src/data/providers/index.ts` picks the provider. That is the only thing that
changes when the real ring arrives.

Mock data is deterministic: each day's hidden plan depends only on `MOCK_SEED` and the date, so past
days stay the same as time moves on. The plan is used only to shape heart-rate and step readings. The
app has to estimate sleep from those readings, exactly as it will with the real ring.

To start over with fresh data, delete Expo Go's data for the app or reinstall Expo Go.

## Folder map

```
app/                 Expo Router routes (thin files)
src/config/          appConfig: app name, mock seed, data source
src/theme/           colors, typography, spacing, layout
src/components/      shared UI: ScoreDial, Card, FloatingTabBar, DetailScreen, InfoSheet, ...
src/components/charts/  Sparkline, LineChart, BarChart, SleepTimeline, HorizontalBars, GaugeBar, chartMath
src/types/           raw, provider, computed, profile
src/data/providers/  RingDataProvider, MockRingProvider, ColmiRingProvider
src/data/mock/       seeded random, day plans, generator (mockTruth is test-only)
src/data/db/         SQLite setup and repositories
src/data/            syncService, syncFilters, deviceManager
src/scoring/         sleep, recovery, strain, activities, calories, health monitor, engine
src/store/           zustand app store
src/features/        one folder per screen (home, sleep, recovery, strain, healthMonitor, live, trends,
                     appInit) plus shared hooks
src/insights/        rule-based insight sentences
src/utils/           format, time, series, haptics
__tests__/           Jest tests for pure logic
```

## Status

**Prompt 1 (done):** foundation, full scoring engine, design system, tab shell, and the Home screen on
mock data. The Device tab is still a placeholder.

**Calibration fixes:**
- Strain counts everyday movement: a light zone (hrr 0.30–0.50, weight 0.5, reported as `lightMinutes`) and a load divisor of 200. Mock days now include on-feet time so desk, walking, workout and hard days land in distinct ranges.
- Bedtime and wake time use the 5-minute heart-rate samples, so they land on realistic minutes instead of 15-minute boundaries. Awake intervals inside the night still use 15-minute epochs.
- Tests always run in America/Chicago (`jest.globalSetup.js`), including checks on the 23-hour and 25-hour daylight-saving days.

**Prompt 2 (done):** Sleep, Recovery and Strain detail screens, opened from the Home dials for the selected day.
- Chart kit in `src/components/charts/`, drawn with react-native-svg only. The math (scaling, nice axis ranges, gaps) lives in `chartMath.ts` and is tested.
- `src/insights/insightGenerator.ts` turns scores into one or two plain sentences using fixed rules, and `src/scoring/strainTarget.ts` suggests a strain range from recovery.
- `useDaySamples(dayKey)` loads a day's raw heart rate and steps for the charts and caches them per day and per sync.
- Each screen's info button opens a sheet explaining how PULSE estimates its metrics from the ring's heart rate and steps.
- Web: `metro.config.js` lets expo-sqlite load on web. Web is only for checking layouts; the app targets iPhone.

**Prompt 3 (done):** Health Monitor, Live, and the Health (trends) tab.
- **Health Monitor** (`/health-monitor`) compares last night's resting and sleeping heart rate with your normal range (30-day mean ± 1.5 SD). The range math is in `src/scoring/healthMonitor.ts`. SpO2 spot checks are listed but never counted in the status.
- **Live** (`/live`, a full-screen modal) streams heart rate with a beating heart, a 60-second chart and session stats, and runs SpO2 spot checks: 30 seconds, median of valid readings (70–100), saved to SQLite. Open it on SpO2 with `/live?mode=spo2`. Only one stream runs at a time, and streams stop when the screen closes or the app goes to the background. The pure helpers are in `src/features/live/liveMath.ts`.
- **Health tab** shows nine metrics over 7, 30 or 90 days, each with its average and a half-vs-half trend arrow. Tapping a card opens `/trend/[metric]` with min, max, best and worst days and a daily list; tapping a day opens it on Home. The aggregation is in `src/features/trends/trendMath.ts`.

PULSE's scores are simple, explainable approximations, and every number is in
`src/scoring/scoringConstants.ts`.
