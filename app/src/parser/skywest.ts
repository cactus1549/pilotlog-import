import { CrewInfo, FlightRow } from '../domain/types';
import {
  normalizeAirport,
  normalizeDate,
  normalizeDuration,
  normalizeName,
  normalizeTime,
} from '../utils/normalize';

const DATE_LINE = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{2}-\d{2}-\d{4})$/i;
const FLIGHT_LINE = /\b(?:UA|XUA|HA)?\*?(\d{3,4})\b\s+([A-Z]{3})\s+([A-Z]{3})\s+(\d{1,2}:\d{2})\s+(\d{1,2}:\d{2})\s+(\d{1,2}:\d{2})\s+(\d{1,2}:\d{2})/;

function extractTaggedPerson(text: string, tags: string[]): string {
  const tagRegex = new RegExp(`(?:${tags.join('|')})\\s*:?\\s*V?(\\d{5,7}\\s+[A-Za-z][A-Za-z' -]+)`, 'i');
  const match = text.match(tagRegex);
  return match ? normalizeName(match[1]) : '';
}

function extractTaggedPeople(text: string, tags: string[]): string[] {
  const tagRegex = new RegExp(`(?:${tags.join('|')})\\s*:?\\s*V?(\\d{5,7}\\s+[A-Za-z][A-Za-z' -]+)`, 'gi');
  const results: string[] = [];

  for (const match of text.matchAll(tagRegex)) {
    const normalized = normalizeName(match[1]);
    if (normalized && !results.includes(normalized)) {
      results.push(normalized);
    }
  }

  return results;
}

export function extractCrew(rawText: string): CrewInfo {
  const captain =
    extractTaggedPerson(rawText, ['Captain', 'CA']) ||
    normalizeName(rawText.match(/-\s*(\d{5,7}\s+[A-Za-z][A-Za-z' -]+)\s*-\s*[A-Z]{3}\s+ER7\s+CA/i)?.[1] ?? '');

  const firstOfficer = extractTaggedPerson(rawText, ['First Officer', 'Fist officer', 'FO']);

  const flightAttendants = extractTaggedPeople(rawText, ['Flight Attendant', 'FA', 'FF', 'A']);

  return {
    captain,
    firstOfficer,
    flightAttendants,
  };
}

export function parseSkywestPairing(rawText: string): FlightRow[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const crew = extractCrew(rawText);

  let currentDate = '';
  const rows: FlightRow[] = [];

  for (const line of lines) {
    const dateMatch = line.match(DATE_LINE);
    if (dateMatch) {
      currentDate = normalizeDate(dateMatch[2]);
      continue;
    }

    const flightMatch = line.match(FLIGHT_LINE);
    if (!flightMatch) {
      continue;
    }

    rows.push({
      Flight: flightMatch[1],
      Date: currentDate,
      'A/C Type': 'ER7',
      Tail: '',
      Origin: normalizeAirport(flightMatch[2]),
      Dest: normalizeAirport(flightMatch[3]),
      Depart: normalizeTime(flightMatch[4]),
      Arrive: normalizeTime(flightMatch[5]),
      Block: normalizeDuration(flightMatch[6]),
      Credit: normalizeDuration(flightMatch[7]),
      Captain: crew.captain,
      'First Officer': crew.firstOfficer,
      'Flight Attendant': crew.flightAttendants.join(' '),
    });
  }

  return rows;
}
