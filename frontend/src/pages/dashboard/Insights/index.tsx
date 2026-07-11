import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, AlertCircle, Smile, Meh, Frown, Download, Pencil,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
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
  const [data, setData] = useState<CallInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  useEffect(() => {
    let alive = true;
    setLoading(true);
    insightsAPI
      .getCallInsights(days)
      .then((d) => alive && (setData(d), setError('')))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Failed to load insights'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [days]);

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
    <DashboardLayout fullWidth>
      <div className="scrollbar-hide h-full overflow-y-auto bg-[hsl(var(--ds-off-white))] text-slate-950">
        <div className="mx-auto w-full max-w-[1100px] space-y-5 px-4 py-6 md:px-6 md:py-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Performance &amp; ROI</h1>
            <p className="mt-1 text-sm text-slate-500">
              What your AI receptionist handled — and what it’s worth to your business.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          {loading ? (
            <SkeletonBody />
          ) : !hasCalls ? (
            <div className="flex flex-col items-center rounded-xl border border-slate-100 bg-white px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <TrendingUp size={22} />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-700">No call data yet</p>
              <p className="mt-1 max-w-sm text-sm text-slate-400">
                Once your AI starts taking calls, this page shows answered vs missed, minutes handled, peak hours, and
                more.
              </p>
            </div>
          ) : (
            <>
              {/* KPI cards — fig2 metric style: muted label over a big bold value */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <Kpi label="Total calls" value={String(s!.total_calls)} />
                <Kpi label="Answered rate" value={`${s!.answered_rate}%`} sub={`${s!.answered} handled`} />
                <Kpi
                  label="Missed calls"
                  value={String(s!.missed)}
                  sub={s!.missed > 0 ? 'recoverable revenue' : 'none missed'}
                />
                <Kpi
                  label="Minutes handled"
                  value={String(s!.minutes_handled)}
                  sub={`avg ${fmtDuration(s!.avg_duration_seconds)}/call`}
                />
                <Kpi label="Bookings" value={String(s!.bookings)} sub={`${s!.booking_rate}% of calls`} />

                {/* Revenue captured — bookings × user-set average booking value */}
                <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
                  <div className="text-[13px] font-medium text-slate-400">Revenue captured</div>
                  {bookingValue > 0 ? (
                    <div className="mt-2 text-[26px] leading-8 font-bold tracking-tight text-emerald-600">
                      ${revenueCaptured.toLocaleString()}
                    </div>
                  ) : (
                    <div className="mt-2 text-[26px] leading-8 font-bold tracking-tight text-slate-300">$—</div>
                  )}
                  {editingValue ? (
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[11px] text-slate-400">$</span>
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
                        className="w-16 rounded border border-emerald-300 px-1.5 py-0.5 text-[11px] outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                      <span className="text-[11px] text-slate-400">/booking</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setValueDraft(bookingValue ? String(bookingValue) : '');
                        setEditingValue(true);
                      }}
                      className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      <Pencil size={10} />
                      {bookingValue > 0 ? `$${bookingValue}/booking` : 'Set booking value'}
                    </button>
                  )}
                </div>
              </div>

              {/* Row: calls over time + outcomes */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Hero chart — fig2 Analytics style: big number + controls inside the card */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
                  <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
                    <div>
                      <p className="text-[13px] font-medium text-slate-400">Total calls</p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight text-slate-950">{s!.total_calls.toLocaleString()}</span>
                        <span className="text-xs text-slate-400">answered vs missed, by day</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center rounded-[7px] border border-slate-300 p-0.5">
                        {PERIODS.map((p) => (
                          <button
                            key={p.value}
                            onClick={() => setDays(p.value)}
                            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                              days === p.value ? 'bg-slate-200 text-slate-950' : 'text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={exportCSV}
                        disabled={!data || !hasCalls}
                        title="Download CSV"
                        className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-slate-300 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="px-3 pb-4 pt-3">
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
                </div>

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
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <ChartCard className="lg:col-span-2" title="Peak call hours" subtitle="When your customers call most">
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

                <div className="space-y-4">
                  <ChartCard title="Sentiment" subtitle="How callers felt">
                    <div className="space-y-3 pt-1">
                      <SentimentBar icon={Smile} color={COLORS.positive} label="Positive" value={sentiment.positive} total={sentiment.total} />
                      <SentimentBar icon={Meh} color={COLORS.neutral} label="Neutral" value={sentiment.neutral} total={sentiment.total} />
                      <SentimentBar icon={Frown} color={COLORS.negative} label="Negative" value={sentiment.negative} total={sentiment.total} />
                    </div>
                  </ChartCard>

                  {s!.follow_ups > 0 && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
                      <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">{s!.follow_ups} calls need follow-up</p>
                        <p className="text-xs text-amber-700">Review these in Call Logs so no lead slips through.</p>
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

const Kpi = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="text-[13px] font-medium text-slate-400">{label}</div>
    <div className="mt-2 text-[26px] leading-8 font-bold tracking-tight text-slate-950">{value}</div>
    {sub && <div className="mt-1 text-[11px] text-slate-400">{sub}</div>}
  </div>
);

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
    <div className="mb-3">
      <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
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
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {[0, 1, 2, 3, 4].map((i) => (
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
