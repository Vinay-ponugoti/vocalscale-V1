import * as XLSX from 'xlsx';
import { parseISO } from 'date-fns';
import { toZonedTime, format as formatTZ } from 'date-fns-tz';
import { env } from '../../../config/env';
import { getAuthHeader } from '../../../lib/api';

export type ExportRange = 'today' | 'yesterday' | '7d' | '30d' | 'all';

export const EXPORT_RANGE_OPTIONS: { value: ExportRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' }
];

interface ExportCall {
  id: string;
  caller_name?: string;
  caller_phone?: string;
  phone_number?: string;
  status?: string;
  category?: string;
  duration_seconds?: number;
  created_at: string;
  lead_score?: number;
  follow_up_required?: boolean;
  is_urgent?: boolean;
  summary?: string;
}

const getRangeBounds = (range: ExportRange): { start?: Date; end?: Date } => {
  const now = new Date();
  switch (range) {
    case 'today': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { start };
    }
    case 'yesterday': {
      const start = new Date(now);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case '7d':
      return { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    case '30d':
      return { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    case 'all':
    default:
      return {};
  }
};

// Fetch every call in the range, paging through the API (server caps size at 100).
const fetchAllCallsInRange = async (range: ExportRange): Promise<ExportCall[]> => {
  const { start, end } = getRangeBounds(range);
  const headers = await getAuthHeader();
  const size = 100;
  let page = 1;
  let total = Infinity;
  const all: ExportCall[] = [];

  while (all.length < total) {
    const params = new URLSearchParams();
    if (start) params.append('start_date', start.toISOString());
    if (end) params.append('end_date', end.toISOString());
    params.append('page', String(page));
    params.append('size', String(size));
    params.append('attention_first', 'false');

    const response = await fetch(`${env.API_URL}/dashboard/calls?${params.toString()}`, { headers });
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    const data = await response.json();
    const items: ExportCall[] = data.items || [];
    all.push(...items);
    total = typeof data.total === 'number' ? data.total : all.length;

    if (items.length < size) break;
    page += 1;
    if (page > 1000) break; // safety valve
  }

  return all;
};

const formatDuration = (seconds?: number) => {
  const total = seconds || 0;
  const mins = Math.floor(total / 60);
  const secs = Math.floor(total % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

const HEADERS = [
  'Caller Name',
  'Phone Number',
  'Date',
  'Time',
  'Status',
  'Type',
  'Duration',
  'Lead Score',
  'Follow-up',
  'Summary'
];

// Fetches calls in the range and triggers a structured .xlsx download.
// Returns the number of rows exported (0 = nothing in range).
export const exportCallsToExcel = async (range: ExportRange, timezone: string): Promise<number> => {
  const calls = await fetchAllCallsInRange(range);

  const rows = calls.map((call) => {
    const zoned = toZonedTime(parseISO(call.created_at), timezone);
    return {
      'Caller Name': call.caller_name || 'Unknown',
      'Phone Number': call.caller_phone || call.phone_number || '',
      Date: formatTZ(zoned, 'MMM dd, yyyy', { timeZone: timezone }),
      Time: formatTZ(zoned, 'h:mm a', { timeZone: timezone }),
      Status: call.status || '',
      Type: call.category || 'General',
      Duration: formatDuration(call.duration_seconds),
      'Lead Score': call.lead_score != null ? call.lead_score : '',
      'Follow-up': call.follow_up_required || call.is_urgent ? 'Yes' : 'No',
      Summary: call.summary || ''
    };
  });

  const worksheet = rows.length
    ? XLSX.utils.json_to_sheet(rows, { header: HEADERS })
    : XLSX.utils.aoa_to_sheet([HEADERS]);

  worksheet['!cols'] = [
    { wch: 22 }, { wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 14 },
    { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 50 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Call Logs');

  const stamp = formatTZ(toZonedTime(new Date(), timezone), 'yyyy-MM-dd', { timeZone: timezone });
  XLSX.writeFile(workbook, `call-logs-${range}-${stamp}.xlsx`);

  return rows.length;
};
