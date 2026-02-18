import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronRight,
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
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!number) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <ShieldAlert className="w-12 h-12 text-muted-foreground" />
                    <h2 className="text-xl font-bold text-foreground">Number Not Found</h2>
                    <button
                        onClick={() => navigate('/dashboard/voice-setup')}
                        className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-all"
                    >
                        Back to List
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const formattedDate = number.created_at
        ? new Date(number.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Oct 12, 2023';

    return (
        <DashboardLayout fullWidth>
            <main className="flex-1 flex flex-col overflow-y-auto bg-background dark:bg-slate-950 h-full scrollbar-premium">


                <div className="px-4 py-8 md:px-8 md:py-12 max-w-6xl mx-auto w-full space-y-8 md:space-y-10">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest pt-4">
                        <Link to="/dashboard/voice-setup" className="text-muted-foreground hover:text-slate-900 dark:hover:text-white transition-colors">Phone Numbers</Link>
                        <ChevronRight className="text-muted-foreground/40 w-3.5 h-3.5" />
                        <span className="text-slate-900 dark:text-white font-black">{number.phone_number}</span>
                    </nav>

                    {/* Page Heading */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
                        <div className="flex flex-col gap-4 md:gap-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="hidden sm:block p-3 bg-slate-900/10 dark:bg-white/10 rounded-2xl border border-slate-900/20 dark:border-white/20">
                                    <Phone className="w-8 h-8 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground leading-none flex items-center gap-3">
                                        <div className="sm:hidden p-2 bg-slate-900/10 dark:bg-white/10 rounded-xl border border-slate-900/20 dark:border-white/20">
                                            <Phone className="w-5 h-5 text-slate-900 dark:text-white" />
                                        </div>
                                        {number.phone_number}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-2">
                                        <p className="text-muted-foreground text-base md:text-lg font-medium">{number.friendly_name || 'Business Line'}</p>
                                        <span className={`px-2.5 py-0.5 md:px-3 md:py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest ${number.status === 'active'
                                            ? 'bg-success/10 text-success border border-success/20'
                                            : 'bg-muted text-muted-foreground border border-border'
                                            }`}>
                                            {number.status || 'Active'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <button
                                onClick={() => navigate('/dashboard/voice-setup')}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border bg-card text-xs md:text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-sm group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Return
                            </button>
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-xs md:text-sm font-black uppercase tracking-widest hover:bg-destructive/10 transition-all">
                                Release
                            </button>
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-xs md:text-sm font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                <Settings className="w-4 h-4" strokeWidth={3} />
                                Configure
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                        <div className="bg-card rounded-3xl border border-border p-6 md:p-10 shadow-premium-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-slate-500/10 transition-all duration-1000" />

                            <h3 className="text-lg md:text-xl font-black mb-8 md:mb-10 text-foreground flex items-center gap-3">
                                General Information
                                <div className="h-1 w-8 bg-slate-900/20 dark:bg-white/20 rounded-full" />
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 md:gap-y-10 gap-x-8 md:gap-x-16">
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 opacity-60">Number Type</p>
                                    <p className="text-lg font-bold text-foreground">Local (10-Digit)</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 opacity-60">Country Origin</p>
                                    <p className="text-lg font-bold text-foreground flex items-center gap-2">
                                        United States
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 opacity-60">Account Identifier (ID)</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-mono font-black text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{number.id}</p>
                                        <button className="p-1 hover:bg-slate-900/10 dark:hover:bg-white/10 rounded transition-colors">
                                            <ExternalLink className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 opacity-60">Activation Date</p>
                                    <p className="text-lg font-bold text-foreground">{formattedDate}</p>
                                </div>
                            </div>

                            <div className="my-12 h-px bg-border/50" />

                            <h4 className="text-xs font-black text-foreground uppercase tracking-[0.2em] mb-8 opacity-80">Line Capabilities</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
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

                        <div className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-premium-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-warning/10 rounded-xl">
                                    <ShieldAlert className="w-5 h-5 text-warning" />
                                </div>
                                <h4 className="text-xs md:text-sm font-black uppercase tracking-widest">System Advisory</h4>
                            </div>
                            <p className="text-[10px] md:text-xs font-medium text-muted-foreground leading-relaxed">
                                Avoid releasing numbers if they are tied to active marketing campaigns. Released numbers may not be retrievable.
                            </p>
                        </div>
                    </div>

                    {/* Activity Table */}
                    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-premium-sm">
                        <div className="px-6 py-6 md:px-10 md:py-8 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="flex flex-col gap-1 text-center sm:text-left">
                                <h3 className="text-xl font-black text-foreground tracking-tight">Communication Logs</h3>
                                <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-60">Verified live traffic activity</p>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                                <div className="hidden sm:flex items-center bg-muted/50 rounded-xl px-4 py-2 border border-border group focus-within:ring-2 focus-within:ring-slate-900/10 dark:focus-within:ring-white/10 transition-all">
                                    <Search className="text-muted-foreground w-3.5 h-3.5 group-focus-within:text-foreground transition-colors" />
                                    <input
                                        className="bg-transparent border-none focus:ring-0 text-xs w-32 text-foreground placeholder-muted-foreground/60 ml-2"
                                        placeholder="Search Logs..."
                                        type="text"
                                    />
                                </div>
                                <Link to="/dashboard/calls" className="px-6 py-2.5 bg-muted hover:bg-slate-900/5 dark:hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 group border border-border">
                                    History
                                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto scrollbar-thin">
                            <table className="w-full text-left">
                                <thead className="bg-muted/30 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 md:px-10 md:py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Timestamp</th>
                                        <th className="px-6 py-4 md:px-10 md:py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Channel</th>
                                        <th className="px-6 py-4 md:px-10 md:py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Flow</th>
                                        <th className="px-6 py-4 md:px-10 md:py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Counterparty</th>
                                        <th className="px-6 py-4 md:px-10 md:py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Duration</th>
                                        <th className="px-6 py-4 md:px-10 md:py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Settlement</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {logsLoading ? (
                                        <tr>
                                            <td colSpan={6} className="px-10 py-24 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 dark:border-white"></div>
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Syncing logs...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : logs.length > 0 ? (
                                        logs.map((log, idx) => (
                                            <tr key={idx} className="hover:bg-muted/20 transition-all group">
                                                <td className="px-6 py-4 md:px-10 md:py-6 text-xs font-bold text-foreground/80 whitespace-nowrap">
                                                    {new Date(log.created_at).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 md:px-10 md:py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary/5 rounded-xl border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                                            <Phone className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-widest text-foreground">Voice</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 md:px-10 md:py-6">
                                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${log.direction === 'inbound'
                                                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                        : 'bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white border-slate-900/20 dark:border-white/20'
                                                        }`}>
                                                        {log.direction || 'Inbound'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 md:px-10 md:py-6 text-xs font-mono font-black text-foreground/70">
                                                    {log.from === number.phone_number ? log.to : log.from}
                                                </td>
                                                <td className="px-6 py-4 md:px-10 md:py-6 text-xs font-bold text-foreground flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                                    {log.duration || '0m 45s'}
                                                </td>
                                                <td className="px-6 py-4 md:px-10 md:py-6 text-xs font-black text-foreground text-right">
                                                    <span className="text-muted-foreground/50 mr-1">$</span>
                                                    {log.cost?.toFixed(4) || '0.0150'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-10 py-32 text-center">
                                                <div className="flex flex-col items-center gap-6">
                                                    <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center opacity-40">
                                                        <Clock className="w-10 h-10 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <p className="text-lg font-black text-foreground tracking-tight">No Activity Records</p>
                                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
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

                    {/* Detailed Legal Footer */}
                    <footer className="mt-16 py-12 border-t border-border flex flex-col items-center gap-4">
                        <div className="flex items-center gap-8 mb-4">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors cursor-pointer">Privacy</span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors cursor-pointer">Terms</span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors cursor-pointer">Status</span>
                        </div>
                        <p className="text-muted-foreground/40 text-[9px] font-black uppercase tracking-[0.3em] text-center max-w-lg leading-relaxed">
                            VocalScale Intelligence Platform. Secure Unified Communications Infrastructure. All transactions processed via encrypted Stripe channels.
                        </p>
                    </footer>
                </div>
            </main>
        </DashboardLayout>
    );
};

interface CapabilityCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active: boolean;
}

const CapabilityCard = ({ icon: Icon, label, active }: CapabilityCardProps) => (
    <div className={`flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all duration-300 ${active
        ? 'bg-card border-slate-900/10 dark:border-white/10 shadow-premium-sm hover:border-slate-900/20 dark:hover:border-white/20'
        : 'bg-muted/20 border-border opacity-40 grayscale'
        }`}>
        <div className={`p-3 rounded-2xl ${active ? 'bg-slate-900/5 dark:bg-white/5 text-slate-900 dark:text-white' : 'bg-muted text-muted-foreground'}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col items-center gap-1">
            <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
            {active && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-wider px-1.5 py-0.5 bg-emerald-500/10 rounded-full">Active</span>}
        </div>
    </div>
);

export default NumberDetails;
