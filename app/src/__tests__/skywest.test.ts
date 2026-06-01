import { describe, expect, test } from 'vitest';

import { toPilotlogCsv } from '../export/csv';
import { extractCrew, parseSkywestPairing } from '../parser/skywest';

const SAMPLE = `
OT2 N5908B ER7 - 090245 Sacha Sardoinfirri - DEN ER7 CA
Monday 06-01-2026
UA5464 DEN SFO 09:43 11:25 1:27 1:14
Tuesday 06-02-2026
UA4643 LAX SAN 09:00 10:08 1:08 0:56
Captain: 090245 Sacha Sardoinfirri
First Officer: 121703 Amber Westphal
FA: 046565 Jessica Ortega
FF: 048930 Diana Sanow
`;

describe('extractCrew', () => {
  test('extracts captain, first officer, and flight attendants', () => {
    const crew = extractCrew(SAMPLE);

    expect(crew.captain).toBe('090245 Sacha Sardoinfirri');
    expect(crew.firstOfficer).toBe('121703 Amber Westphal');
    expect(crew.flightAttendants).toEqual([
      '046565 Jessica Ortega',
      '048930 Diana Sanow',
    ]);
  });
});

describe('parseSkywestPairing', () => {
  test('parses date-scoped flights into pilotlog rows', () => {
    const rows = parseSkywestPairing(SAMPLE);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      Flight: '5464',
      Date: '06/01/2026',
      Origin: 'DEN',
      Dest: 'SFO',
      Depart: '09:43',
      Arrive: '11:25',
      Block: '01:27',
      Credit: '01:14',
    });

    expect(rows[1].Date).toBe('06/02/2026');
  });
});

describe('toPilotlogCsv', () => {
  test('serializes parsed rows into a CSV payload', () => {
    const csv = toPilotlogCsv(parseSkywestPairing(SAMPLE));

    expect(csv).toContain('Flight,Date,A/C Type,Tail,Origin,Dest,Depart,Arrive,Block,Credit,Captain,First Officer,Flight Attendant');
    expect(csv).toContain('5464,06/01/2026,ER7,,DEN,SFO,09:43,11:25,01:27,01:14,090245 Sacha Sardoinfirri,121703 Amber Westphal,046565 Jessica Ortega 048930 Diana Sanow');
  });
});
