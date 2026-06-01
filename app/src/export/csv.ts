import { FlightRow, PILOTLOG_HEADERS } from '../domain/types';

function escapeCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

export function toPilotlogCsv(rows: FlightRow[]): string {
  const header = PILOTLOG_HEADERS.join(',');

  const body = rows.map((row) => PILOTLOG_HEADERS.map((key) => escapeCell(row[key] ?? '')).join(','));

  return [header, ...body].join('\n');
}
