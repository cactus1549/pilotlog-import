# pilotlog-import

MVP React Native (Expo + TypeScript) app for turning SkyWest pairing screenshot text into Crewlounge Pilotlog CSV rows.

## What this MVP does

- Accepts OCR text (paste into app UI).
- Parses SkyWest-style pairing lines into flight segments.
- Extracts crew fields (Captain, First Officer, Flight Attendant).
- Cleans/normalizes date/time/airport values.
- Exports Crewlounge-compatible CSV columns:
  - `Flight, Date, A/C Type, Tail, Origin, Dest, Depart, Arrive, Block, Credit, Captain, First Officer, Flight Attendant`

## Project layout

- `/app/src/parser/skywest.ts` - SkyWest text parsing + crew extraction
- `/app/src/utils/normalize.ts` - reusable data cleanup/normalization helpers
- `/app/src/export/csv.ts` - CSV serializer for Pilotlog headers
- `/app/src/ocr/ocrEngine.ts` - OCR adapter interface (pluggable provider)
- `/app/src/domain/types.ts` - shared domain types and CSV headers
- `/app/src/__tests__/skywest.test.ts` - focused parser/export tests

## Why this is reusable

The parser/export pipeline is modular and provider-agnostic:

1. **OCR provider layer** (`ocrEngine.ts`) can swap to Apple Vision, ML Kit, or cloud OCR.
2. **Parser layer** (`parser/`) can add airline-specific parsers without changing exporter.
3. **Normalizer layer** (`utils/normalize.ts`) is shared across all parser variants.
4. **Exporter layer** (`export/csv.ts`) can target additional logbook formats.

## Setup (Codespaces or local)

Requirements:

- Node.js 20+
- npm 10+

Install:

```bash
cd /tmp/workspace/cactus1549/pilotlog-import/app
npm install
```

Run app:

```bash
npm run start
```

Run checks:

```bash
npm run lint
npm run typecheck
npm run test
```

## Usage

1. Launch app with `npm run start`.
2. Paste OCR text from a SkyWest pairing screenshot into the **Raw OCR Text** box.
3. Review parsed segment count.
4. Copy generated **CSV Output** and save/import into Crewlounge Pilotlog.

> Note: this MVP currently demonstrates OCR ingestion by text paste. Add a concrete OCR implementation via `OcrEngine` for direct image-to-text flow.

## Assumptions

- OCR output includes flight lines in a predictable order, for example:
  - `UA5464 DEN SFO 09:43 11:25 1:27 1:14`
- Date headers appear as `Monday 06-01-2026` (or similar day name + `MM-DD-YYYY`).
- Crew entries include recognizable tags (`Captain`, `First Officer`, `FA`, `FF`, `CA`).

## Limitations

- OCR noise can still break parsing for heavily distorted screenshots.
- Tail number and aircraft type defaults are simplified in current parser (`ER7`, empty tail unless source format is extended).
- Pilot creation/check against Crewlounge API is not implemented in this MVP.
- No persistent file write/share action yet; current app produces CSV text for copy/export.
