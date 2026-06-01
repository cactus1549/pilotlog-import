# pilotlog-import

React Native (Expo + TypeScript) app for turning SkyWest pairing screenshots into Crewlounge Pilotlog CSV rows.

## What this MVP does

- Picks a screenshot from Photos.
- Runs OCR through an ML Kit adapter.
- Parses SkyWest-style pairing text into flight segments.
- Extracts crew fields (Captain, First Officer, Flight Attendant).
- Cleans/normalizes date/time/airport values.
- Saves and opens the iOS/Android share sheet for CSV export.

CSV columns produced:

`Flight, Date, A/C Type, Tail, Origin, Dest, Depart, Arrive, Block, Credit, Captain, First Officer, Flight Attendant`

## Project layout

- `/app/App.tsx` - UI flow (pick image, OCR, parse, save/share CSV)
- `/app/src/parser/skywest.ts` - SkyWest text parsing + crew extraction
- `/app/src/utils/normalize.ts` - reusable cleanup/normalization helpers
- `/app/src/export/csv.ts` - CSV serializer for Pilotlog headers
- `/app/src/ocr/ocrEngine.ts` - OCR adapter (ML Kit + fallback behavior)
- `/app/src/utils/csvFile.ts` - CSV file naming + MIME helpers
- `/app/src/domain/types.ts` - shared domain types and CSV headers
- `/app/src/__tests__/` - focused parser/export/helper tests

## Install

### 1) Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI via `npx` (no global install required)

### 2) Install dependencies

```bash
cd /tmp/workspace/cactus1549/pilotlog-import/app
npm install
```

## How to run

### Fast local/dev workflow (PC or Mac)

```bash
cd /tmp/workspace/cactus1549/pilotlog-import/app
npm run start
```

- Open with Expo tools.
- You can still use **Load sample text** and **Save/Share CSV** logic.
- Full native OCR requires a dev build (next section).

### iPhone install with native OCR (Mac required)

Because ML Kit OCR is a native module, use an Expo dev build (not plain Expo Go):

```bash
cd /tmp/workspace/cactus1549/pilotlog-import/app
npx expo prebuild
npx expo run:ios
```

Then on device/simulator:

1. Tap **Pick image + OCR**.
2. Choose SkyWest screenshot.
3. Confirm parsed segment count.
4. Tap **Save/Share CSV**.
5. Share to Files/Drive/AirDrop and import to Crewlounge Pilotlog.

## How to test

From `/tmp/workspace/cactus1549/pilotlog-import/app`:

```bash
npm run lint
npm run typecheck
npm run test
```

Test coverage includes:

- Crew extraction and flight parsing
- Date/time/duration normalization through parser behavior
- CSV serialization format
- CSV file helper naming and MIME metadata

## Usage notes

- **Load sample text** gives a no-image path for parser verification.
- **Raw OCR Text** remains editable, so you can correct OCR mistakes before export.
- If OCR module is unavailable, app surfaces a clear error message.

## Assumptions

- OCR output contains flight lines similar to:
  - `UA5464 DEN SFO 09:43 11:25 1:27 1:14`
- Date headers appear as `Monday 06-01-2026` (day + `MM-DD-YYYY`).
- Crew tags include one or more of: `Captain`, `First Officer`, `FA`, `FF`, `CA`.

## Limitations

- OCR quality depends on screenshot clarity and ML Kit recognition.
- Tail number extraction is still simplified (currently empty in exported rows).
- A/C Type is currently set to `ER7` in parser output.
- Pilot existence/create flow for Crewlounge API is not implemented yet.
