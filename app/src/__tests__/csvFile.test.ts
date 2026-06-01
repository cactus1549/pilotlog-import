import { describe, expect, test } from 'vitest';

import { buildCsvFileName, CSV_MIME_TYPE } from '../utils/csvFile';

describe('csv file helpers', () => {
  test('buildCsvFileName returns deterministic timestamped name', () => {
    const fileName = buildCsvFileName(new Date('2026-06-01T18:00:01.000Z'));
    expect(fileName).toBe('pilotlog-20260601-180001.csv');
  });

  test('exports CSV mime type', () => {
    expect(CSV_MIME_TYPE).toBe('text/csv');
  });
});
