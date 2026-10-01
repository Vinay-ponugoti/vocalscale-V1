import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, AlertCircle, Smile, Meh, Frown, Download, Pencil,
  Phone, PhoneIncoming, PhoneMissed, Clock3, CalendarCheck, DollarSign,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';
import { PAGE_CONTAINER, GRID_GAP } from '../../../constants/layout';
import { insightsAPI, type CallInsights } from '../../../api/insights';

const PERIODS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

const COLORS = {
  answered: 'hsl(var(--chart-1))',
  missed: 'rgb(var(--twc-rose-500))',
  transferred: 'hsl(var(--chart-2))',
  other: 'rgb(var(--twc-slate-400))',
  positive: 'rgb(var(--twc-emerald-500))',
  neutral: 'rgb(var(--twc-slate-400))',
  negative: 'rgb(var(--twc-rose-500))',
  unknown: 'rgb(var(--twc-slate-300))',
};

const hourLabel = (h: number) => {
  if (h === 0) return '12a';
  if (h === 12) return '12p';
  return h < 12 ? `${h}a` : `${h - 12}p`;
};

const fmtDuration = (secs: number) => {
  if (!secs) return '0s';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m ? `${m}m ${s}s` : `${s}s`;
};

const BOOKING_VALUE_KEY = 'vs-avg-booking-value';

const Insights = () => {
  const [days, setDays] = useState(30);
  const { data, isLoading: loading, error: queryError } = useQuery<CallInsights>({
    queryKey: ['call-insights', days],
    queryFn: () => insightsAPI.getCallInsights(days),
    staleTime: 60_000,
  });
  const error = queryError instanceof Error ? queryError.message : '';
  const [bookingValue, setBookingValue] = useState(() => {
    const v = Number(localStorage.getItem(BOOKING_VALUE_KEY));
    return Number.isFinite(v) && v > 0 ? v : 0;
  });
  const [editingValue, setEditingValue] = useState(false);
  const [valueDraft, setValueDraft] = useState('');

  const saveBookingValue = () => {
    const v = Math.max(0, Math.round(Number(valueDraft) || 0));
    setBookingValue(v);
    localStorage.setItem(BOOKING_VALUE_KEY, String(v));
    setEditingValue(false);
  };

  const s = data?.summary;

  const dayChart = useMemo(
    () =>
      (data?.by_day || []).map((d) => ({
        date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        answered: d.answered,
        missed: d.missed,
      })),
    [data],
  );

  const hourChart = useMemo(
    () => (data?.by_hour || []).map((h) => ({ label: hourLabel(h.hour), count: h.count })),
    [data],
  );

  const outcomePie = useMemo(
    () =>
      (data?.outcomes || [])
        .filter((o) => (o.count ?? 0) > 0)
        .map((o) => ({ name: o.outcome || 'other', value: o.count })),
    [data],
  );

  const categoryBars = useMemo(
    () =>
      [...(data?.categories || [])]
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
        .map((c) => ({ name: (c.category || '').replace(/_/g, ' '), count: c.count })),
    [data],
  );

  const sentiment = useMemo(() => {
    const total = (data?.sentiment || []).reduce((n, x) => n + x.count, 0) || 1;
    const get = (k: string) => data?.sentiment.find((x) => x.sentiment === k)?.count ?? 0;
    return {
      total,
      positive: get('positive'),
      neutral: get('neutral'),
      negative: get('negative'),
    };
  }, [data]);

  const hasCalls = (s?.total_calls ?? 0) > 0;
  const revenueCaptured = bookingValue > 0 ? (s?.bookings ?? 0) * bookingValue : 0;

  const exportCSV = () => {
    if (!data) return;
    const sm = data.summary;
    const lines: string[] = [
      'VocalScale performance export',
      `Period,Last ${data.period_days} days`,
      `Exported,${new Date().toISOString()}`,
      '',
      'Metric,Value',
      `Total calls,${sm.total_calls}`,
      `Answered,${sm.answered}`,
      `Missed,${sm.missed}`,
      `Answered rate,${sm.answered_rate}%`,
      `Bookings,${sm.bookings}`,
      `Booking rate,${sm.booking_rate}%`,
      `Minutes handled,${sm.minutes_handled}`,
      `Avg call duration (seconds),${sm.avg_duration_seconds}`,
    ];
    if (bookingValue > 0) {
      lines.push(`Avg booking value,$${bookingValue}`);
      lines.push(`Revenue captured (est),$${revenueCaptured}`);
    }
    lines.push('', 'Date,Answered,Missed,Total');
    data.by_day.forEach((d) => lines.push(`${d.date},${d.answered},${d.missed},${d.total}`));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocalscale-performance-${data.period_days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className={PAGE_CONTAINER}>
          <PageHeader
            title="Performance"
            description="What your agent handled, and what it’s worth to your business."
            actions={
              <>
                <div className="inline-flex gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  {PERIODS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setDays(p.value)}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                        days === p.value ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <Button variant="outline" onClick={exportCSV} disabled={!data || !hasCalls}>
                  <Download size={15} /> Export CSV
                </Button>
              </>
            }
          />

          {error && (
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
          )}

          {loading ? (
            <SkeletonBody />
          ) : !hasCalls ? (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <EmptyState
                icon={TrendingUp}
                title="No call data yet"
                description="Once your agent starts taking calls, this page shows answered vs missed calls, minutes, peak hours, and more."
              />
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 ${GRID_GAP}`}>
                <StatCard icon={Phone} label="Total calls" value={s!.total_calls.toLocaleString()} description={`Last ${data?.period_days ?? days} days`} />
                <StatCard icon={PhoneIncoming} tint="emerald" label="Answer rate" value={`${s!.answered_rate}%`} description={`${s!.answered} answered`} />
                <StatCard
                  icon={PhoneMissed}
                  tint="rose"
                  label="Missed"
                  value={String(s!.missed)}
                  description={s!.missed > 0 ? 'Recoverable revenue' : 'None missed'}
                />
                <StatCard
                  icon={Clock3}
                  tint="slate"
                  label="Minutes"
                  value={String(s!.minutes_handled)}
                  description={`Avg ${fmtDuration(s!.avg_duration_seconds)} per call`}
                />
                <StatCard icon={CalendarCheck} tint="emerald" label="Appointments" value={String(s!.bookings)} description={`Booked · ${s!.booking_rate}% of calls`} />


                <StatCard
                  icon={DollarSign}
                  tint="emerald"
                  label="Revenue"
                  value={bookingValue > 0 ? `$${revenueCaptured.toLocaleString()}` : '$—'}
                  valueClassName={bookingValue > 0 ? 'text-emerald-600' : 'text-slate-300'}
                  description={editingValue ? (
                    <span className="flex items-center gap-1">
                      $
                      <input
                        autoFocus
                        value={valueDraft}
                        onChange={(e) => setValueDraft(e.target.value.replace(/[^\d]/g, ''))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveBookingValue();
                          if (e.key === 'Escape') setEditingValue(false);
                        }}
                        onBlur={saveBookingValue}
                        inputMode="numeric"
                        placeholder="150"
                        className="w-16 rounded border border-emerald-300 px-1.5 py-0.5 text-xs outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                      per appointment
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setValueDraft(bookingValue ? String(bookingValue) : '');
                        setEditingValue(true);
                      }}
                      className="flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      <Pencil size={10} />
                      {bookingValue > 0 ? `$${bookingValue} per appointment` : 'Set appointment value'}
                    </button>
                  )}
                />
              </div>

              {/* Row: calls over time + outcomes */}
              <div className={`grid grid-cols-1 lg:grid-cols-3 ${GRID_GAP}`}>
                {/* Hero chart — fig2 Analytics style: big number + controls inside the card */}
                <ChartCard className="lg:col-span-2" title="Calls over time" subtitle="Answered vs missed, by day">
                  <div>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={dayChart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gAns" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COLORS.answered} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={COLORS.answered} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gMiss" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COLORS.missed} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={COLORS.missed} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--twc-slate-100))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--twc-slate-400))' }} tickLine={false} axisLine={false} minTickGap={24} />
                      <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--twc-slate-400))' }} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="answered" stackId="1" stroke={COLORS.answered} strokeWidth={2} fill="url(#gAns)" name="Answered" />
                      <Area type="monotone" dataKey="missed" stackId="1" stroke={COLORS.missed} strokeWidth={2} fill="url(#gMiss)" name="Missed" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <Legend items={[{ c: COLORS.answered, l: 'Answered' }, { c: COLORS.missed, l: 'Missed' }]} />
                  </div>
                </ChartCard>

                <ChartCard title="Call outcomes" subtitle="How calls resolved">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={outcomePie} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={2} stroke="none">
                        {outcomePie.map((entry) => (
                          <Cell key={entry.name} fill={(COLORS as Record<string, string>)[entry.name] || COLORS.other} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-1 space-y-1.5">
                    {outcomePie.map((o) => (
                      <div key={o.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 capitalize text-slate-600">
                          <span className="h-2 w-2 rounded-full" style={{ background: (COLORS as Record<string, string>)[o.name] || COLORS.other }} />
                          {o.name}
                        </span>
                        <span className="font-medium text-slate-800">{o.value}</span>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>

              {/* Row: peak hours + sentiment/category */}
              <div className={`grid grid-cols-1 lg:grid-cols-3 ${GRID_GAP}`}>
                <ChartCard className="lg:col-span-2" title="Peak call hours" subtitle="When people call most">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={hourChart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--twc-slate-100))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'rgb(var(--twc-slate-400))' }} tickLine={false} axisLine={false} interval={1} />
                      <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--twc-slate-400))' }} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgb(var(--twc-slate-100))' }} />
                      <Bar dataKey="count" fill={COLORS.answered} radius={[4, 4, 0, 0]} name="Calls" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <div className="space-y-4 lg:space-y-6">
                  <ChartCard title="Sentiment" subtitle="How callers felt">
                    <div className="space-y-3 pt-1">
                      <SentimentBar icon={Smile} color={COLORS.positive} label="Positive" value={sentiment.positive} total={sentiment.total} />
                      <SentimentBar icon={Meh} color={COLORS.neutral} label="Neutral" value={sentiment.neutral} total={sentiment.total} />
                      <SentimentBar icon={Frown} color={COLORS.negative} label="Negative" value={sentiment.negative} total={sentiment.total} />
                    </div>
                  </ChartCard>

                  {s!.follow_ups > 0 && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">{s!.follow_ups} calls need attention</p>
                        <p className="text-xs text-amber-700">
                          Review them in <Link to="/dashboard/calls" className="font-semibold underline">Call logs</Link> so nothing slips through.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Categories */}
              {categoryBars.length > 0 && (
                <ChartCard title="What people call about" subtitle="Top call categories">
                  <ResponsiveContainer width="100%" height={Math.max(120, categoryBars.length * 38)}>
                    <BarChart data={categoryBars} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <XAxis type="number" hide allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'rgb(var(--twc-slate-600))' }} tickLine={false} axisLine={false} width={120} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgb(var(--twc-slate-100))' }} />
                      <Bar dataKey="count" fill={COLORS.transferred} radius={[0, 4, 4, 0]} name="Calls" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}
            </>
          )}
      </div>
    </DashboardLayout>
  );
};

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgb(var(--twc-slate-200))',
  fontSize: 12,
  boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
} as const;

const ChartCard = ({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const Legend = ({ items }: { items: { c: string; l: string }[] }) => (
  <div className="mt-2 flex items-center justify-center gap-4">
    {items.map((i) => (
      <span key={i.l} className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="h-2 w-2 rounded-full" style={{ background: i.c }} />
        {i.l}
      </span>
    ))}
  </div>
);

const SentimentBar = ({
  icon: Icon,
  color,
  label,
  value,
  total,
}: {
  icon: React.ElementType;
  color: string;
  label: string;
  value: number;
  total: number;
}) => {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-slate-600">
          <Icon size={13} style={{ color }} /> {label}
        </span>
        <span className="font-medium text-slate-700">
          {value} · {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

const SkeletonBody = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-white" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="h-72 animate-pulse rounded-xl bg-white lg:col-span-2" />
      <div className="h-72 animate-pulse rounded-xl bg-white" />
    </div>
  </div>
);

export default Insights;
