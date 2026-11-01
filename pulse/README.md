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
src/components/      shared UI: ScoreDial, Card, FloatingTabBar, charts/Sparkline, ...
src/types/           raw, provider, computed, profile
src/data/providers/  RingDataProvider, MockRingProvider, ColmiRingProvider
src/data/mock/       seeded random, day plans, generator (mockTruth is test-only)
src/data/db/         SQLite setup and repositories
src/data/            syncService, syncFilters, deviceManager
src/scoring/         sleep, recovery, strain, activities, calories, health monitor, engine
src/store/           zustand app store
src/features/        one folder per screen (home, appInit, ...)
src/utils/           format, time, series, haptics
__tests__/           Jest tests for pure logic
```

## Status

**Prompt 1 (done):** foundation, full scoring engine, design system, tab shell, and the Home screen on
mock data. Health, Device, Live, Sleep, Recovery, Strain and Health Monitor are placeholders for now.

PULSE's scores are simple, explainable approximations, and every number is in
`src/scoring/scoringConstants.ts`.
