export function normalizeTime(raw: string): string {
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return '';
  }

  const hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);

  if (Number.isNaN(hour) || Number.isNaN(minute) || hour > 23 || minute > 59) {
    return '';
  }

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export function normalizeDuration(raw: string): string {
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return '';
  }

  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export function normalizeDate(raw: string): string {
  const cleaned = raw.trim();

  const slash = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slash) {
    return `${slash[1]}/${slash[2]}/${slash[3]}`;
  }

  const dash = cleaned.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dash) {
    return `${dash[1]}/${dash[2]}/${dash[3]}`;
  }

  return '';
}

export function normalizeAirport(raw: string): string {
  const cleaned = raw.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(cleaned) ? cleaned : '';
}

export function normalizeName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim();
}
