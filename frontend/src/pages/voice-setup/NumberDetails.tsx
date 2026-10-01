import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Settings,
    Search,
    Mic,
    MessageSquare,
    Phone,
    ArrowUpRight,
    Clock,
    ExternalLink,
    ShieldAlert
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { PAGE_CONTAINER } from '../../constants/layout';
import { usePhoneNumbers } from '../../hooks/usePhoneNumbers';
import { env } from '../../config/env';
import { getAuthHeader } from '../../lib/api';

interface CallLog {
    created_at: string;
    from: string;
    to: string;
    direction?: string;
    duration?: string;
    cost?: number;
}

const NumberDetails = () => {
    const { numberId } = useParams<{ numberId: string }>();
    const navigate = useNavigate();
    const { numbers, loading: numbersLoading } = usePhoneNumbers();
    const [logs, setLogs] = useState<CallLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);

    const number = numbers.find(n => n.id === numberId);

    const fetchLogs = useCallback(async () => {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${env.API_URL}/dashboard/calls?limit=10`, {
                headers: { ...headers }
            });
            if (response.ok) {
                const data = await response.json();
                // Handle paginated response structure { items: [], ... }
                const items: CallLog[] = Array.isArray(data) ? data : (data.items || []);

                const filtered = items.filter((log: CallLog) =>
                    log.from === number?.phone_number || log.to === number?.phone_number
                );
                setLogs(filtered);
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setLogsLoading(false);
        }
    }, [number?.phone_number]);

    useEffect(() => {
        if (number) {
            fetchLogs();
        }
    }, [number, fetchLogs]);

    if (numbersLoading) {
        return (
            <DashboardLayout fullWidth>
                <div className="flex h-full items-center justify-center">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
            </DashboardLayout>
        );
    }

    if (!number) {
        return (
            <DashboardLayout fullWidth>
                <EmptyState
                    icon={ShieldAlert}
                    tone="danger"
                    title="Number not found"
                    description="This number may have been released or moved."
                    action={<Button variant="outline" onClick={() => navigate('/dashboard/voice-setup')}>Back to phone numbers</Button>}
                    className="h-full"
                />
            </DashboardLayout>
        );
    }

    const formattedDate = number.created_at
        ? new Date(number.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

    return (
        <DashboardLayout>
            <div className={PAGE_CONTAINER}>
                    <Link to="/dashboard/voice-setup" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-900">
                        <ArrowLeft size={15} /> Back to phone numbers
                    </Link>

                    <PageHeader
                        title={number.phone_number}
                        meta={
                            <span className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${number.status === 'active'
                                ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
                                : 'border border-slate-200 bg-slate-50 text-slate-500'
                                }`}>
                                {number.status || 'active'}
                            </span>
                        }
                        description={number.friendly_name || 'No nickname'}
                        actions={
                            <>
                                <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50">Release</Button>
                                <Button><Settings size={15} /> Configure</Button>
                            </>
                        }
                    />

                    <div className="space-y-6">
                        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                            <h2 className="mb-4 text-base font-semibold text-slate-950">General information</h2>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Number type</p>
                                    <p className="text-sm font-semibold text-slate-950">Local (10-Digit)</p>
                                </div>
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Country</p>
                                    <p className="text-sm font-semibold text-slate-950">
                                        United States
                                    </p>
                                </div>
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Account ID</p>
                                    <div className="flex items-center gap-2">
                                        <p className="max-w-[180px] truncate font-mono text-xs font-bold text-slate-600">{number.id}</p>
                                        <button className="rounded p-1 transition-colors hover:bg-slate-200">
                                            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                                        </button>
                                    </div>
                                </div>
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Activation Date</p>
                                    <p className="text-sm font-semibold text-slate-950">{formattedDate}</p>
                                </div>
                            </div>

                            <div className="my-6 h-px bg-slate-200" />

                            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Capabilities</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <CapabilityCard
                                    icon={Mic}
                                    label="Voice"
                                    active={true}
                                />
                                <CapabilityCard
                                    icon={MessageSquare}
                                    label="SMS"
                                    active={!!number.capabilities?.sms}
                                />
                            </div>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <div className="mb-2 flex items-center gap-3">
                                <div className="rounded-md bg-white p-2 text-amber-600">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <h4 className="text-sm font-semibold text-slate-950">Before you release a number</h4>
                            </div>
                            <p className="text-sm font-medium leading-6 text-slate-600">
                                Avoid releasing numbers if they are tied to active marketing campaigns. Released numbers may not be retrievable.
                            </p>
                        </div>
                    </div>

                    {/* Activity Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row">
                            <div className="flex flex-col gap-1 text-center sm:text-left">
                                <h2 className="text-base font-semibold text-slate-950">Call logs</h2>
                                <p className="text-sm text-slate-500">Recent calls on this number</p>
                            </div>
                            <div className="flex w-full items-center gap-3 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
                                <div className="hidden items-center rounded-lg border border-slate-200 bg-white px-3 py-2 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 sm:flex">
                                    <Search className="h-3.5 w-3.5 text-slate-400" />
                                    <input
                                        className="ml-2 w-32 border-none bg-transparent text-xs font-semibold text-slate-950 placeholder:text-slate-400 focus:ring-0"
                                        placeholder="Search calls…"
                                        type="text"
                                    />
                                </div>
                                <Link to="/dashboard/calls" className="group flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                                    History
                                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Timestamp</th>
                                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Channel</th>
                                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Flow</th>
                                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Counterparty</th>
                                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Duration</th>
                                        <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Settlement</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logsLoading ? (
                                        <tr>
                                            <td colSpan={6} className="px-10 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-700 border-t-transparent"></div>
                                                    <span className="text-sm font-semibold text-slate-500">Syncing logs...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : logs.length > 0 ? (
                                        logs.map((log, idx) => (
                                            <tr key={idx} className="group transition-colors hover:bg-slate-50">
                                                <td className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-slate-700">
                                                    {new Date(log.created_at).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-md border border-blue-100 bg-blue-50 p-2 text-blue-700">
                                                            <Phone className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Voice</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${log.direction === 'inbound'
                                                        ? 'border-blue-100 bg-blue-50 text-blue-700'
                                                        : 'border-slate-200 bg-slate-50 text-slate-700'
                                                        }`}>
                                                        {log.direction || 'Inbound'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 font-mono text-xs font-bold text-slate-600">
                                                    {log.from === number.phone_number ? log.to : log.from}
                                                </td>
                                                <td className="flex items-center gap-2 px-5 py-4 text-xs font-bold text-slate-700">
                                                    <Clock className="h-4 w-4 text-slate-400" />
                                                    {log.duration || '0m 45s'}
                                                </td>
                                                <td className="px-5 py-4 text-right text-xs font-semibold text-slate-700">
                                                    <span className="mr-1 text-slate-400">$</span>
                                                    {log.cost?.toFixed(4) || '0.0150'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-10 py-24 text-center">
                                                <div className="flex flex-col items-center gap-6">
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                                                        <Clock className="h-8 w-8 text-slate-300" />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <p className="text-lg font-semibold tracking-tight text-slate-950">No Activity Records</p>
                                                        <p className="mx-auto max-w-[240px] text-sm font-medium leading-6 text-slate-500">
                                                            Logs will be automatically archived here as traffic occurs.
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

            </div>
        </DashboardLayout>
    );
};

interface CapabilityCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active: boolean;
}

const CapabilityCard = ({ icon: Icon, label, active }: CapabilityCardProps) => (
    <div className={`flex flex-col items-center gap-3 rounded-lg border p-5 transition-colors ${active
        ? 'border-blue-100 bg-blue-50/60'
        : 'border-slate-200 bg-slate-50 opacity-60 grayscale'
        }`}>
        <div className={`rounded-md p-3 ${active ? 'bg-white text-blue-700' : 'bg-white text-slate-400'}`}>
            <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col items-center gap-1">
            <span className={`text-xs font-semibold uppercase tracking-wider ${active ? 'text-slate-950' : 'text-slate-400'}`}>{label}</span>
            {active && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Active</span>}
        </div>
    </div>
);

export default NumberDetails;
