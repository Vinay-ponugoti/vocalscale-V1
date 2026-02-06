import { parseISO } from 'date-fns';
import { toZonedTime, format as formatTZ } from 'date-fns-tz';

/**
 * Standardizes date formatting across the application using a specific timezone.
 * Defaults to the browser's local timezone if none is provided.
 */

export const formatDate = (
  dateStr: string | Date | undefined,
  timezone: string = 'America/New_York',
  formatStr: string = 'MMM dd, yyyy'
) => {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  const zonedDate = toZonedTime(date, timezone);
  return formatTZ(zonedDate, formatStr, { timeZone: timezone });
};

export const formatTime = (
  dateStr: string | Date | undefined,
  timezone: string = 'America/New_York'
) => {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  const zonedDate = toZonedTime(date, timezone);
  return formatTZ(zonedDate, 'h:mm a', { timeZone: timezone });
};

export const formatDateTime = (
  dateStr: string | Date | undefined,
  timezone: string = 'America/New_York'
) => {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  const zonedDate = toZonedTime(date, timezone);
  return formatTZ(zonedDate, 'MMM dd, h:mm a', { timeZone: timezone });
};

/**
 * Gets the start of the day in a specific timezone
 */
export const getZonedStartOfDay = (date: Date, timezone: string) => {
  const zonedDate = toZonedTime(date, timezone);
  zonedDate.setHours(0, 0, 0, 0);
  return zonedDate;
};

/**
 * Helper to get the user's current browser timezone string
 */
export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
