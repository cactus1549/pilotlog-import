export const PILOTLOG_HEADERS = [
  'Flight',
  'Date',
  'A/C Type',
  'Tail',
  'Origin',
  'Dest',
  'Depart',
  'Arrive',
  'Block',
  'Credit',
  'Captain',
  'First Officer',
  'Flight Attendant',
] as const;

export type PilotlogHeader = (typeof PILOTLOG_HEADERS)[number];

export type FlightRow = Record<PilotlogHeader, string>;

export interface CrewInfo {
  captain: string;
  firstOfficer: string;
  flightAttendants: string[];
}
