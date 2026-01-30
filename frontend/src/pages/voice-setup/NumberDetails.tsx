import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronRight,
    ArrowLeft,
    Settings,
    Search,
    Mic,
    MessageSquare,
    Image as ImageIcon,
    Printer,
    CheckCircle2,
    XCircle,
    Wallet,
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

const NumberDetails = () => {
    const { numberId } = useParams<{ numberId: string }>();
    const navigate = useNavigate();
    const { numbers, loading: numbersLoading } = usePhoneNumbers();
    const [logs, setLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);
    const [isTrafficActive, setIsTrafficActive] = useState(true);

    const number = numbers.find(n => n.id === numberId);

    useEffect(() => {
        if (number) {
            fetchLogs();
            setIsTrafficActive(number.status === 'active');
        }
    }, [number]);

    const fetchLogs = async () => {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${env.API_URL}/dashboard/calls?limit=10`, {
                headers: { ...headers }
            });
            if (response.ok) {
                const data = await response.json();
                const filtered = data.filter((log: any) =>
                    log.from === number?.phone_number || log.to === number?.phone_number
                );
                setLogs(filtered);
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setLogsLoading(false);
        }
    };

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

    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);
    const formattedRenewal = renewalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <DashboardLayout fullWidth>
            <main className="flex-1 flex flex-col overflow-y-auto bg-background dark:bg-slate-950 min-h-screen scrollbar-premium">


                <div className="p-8 max-w-6xl mx-auto w-full space-y-10">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest pt-4">
                        <Link to="/dashboard/voice-setup" className="text-muted-foreground hover:text-slate-900 dark:hover:text-white transition-colors">Phone Numbers</Link>
                        <ChevronRight className="text-muted-foreground/40 w-3.5 h-3.5" />
                        <span className="text-slate-900 dark:text-white font-black">{number.phone_number}</span>
                    </nav>

                    {/* Page Heading */}
                    <div className="flex flex-wrap justify-between items-end gap-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-900/10 dark:bg-white/10 rounded-2xl border border-slate-900/20 dark:border-white/20">
                                    <Phone className="w-8 h-8 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none">{number.phone_number}</h1>
                                    <p className="text-muted-foreground text-lg font-medium mt-1.5">{number.friendly_name || 'Business Line'}</p>
                                </div>
                                <span className={`ml-4 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${number.status === 'active'
                                    ? 'bg-success/10 text-success border border-success/20'
                                    : 'bg-muted text-muted-foreground border border-border'
                                    }`}>
                                    {number.status || 'Active'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/dashboard/voice-setup')}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-sm group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Return
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                <Settings className="w-4 h-4" />
                                Configure
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: General Info & Actions */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-card rounded-3xl border border-border p-10 shadow-premium-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-slate-500/10 transition-all duration-1000" />

                                <h3 className="text-xl font-black mb-10 text-foreground flex items-center gap-3">
                                    General Information
                                    <div className="h-1 w-8 bg-slate-900/20 dark:bg-white/20 rounded-full" />
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-16">
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
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <CapabilityCard icon={Mic} label="Voice" active={!!number.capabilities?.voice} />
                                    <CapabilityCard icon={MessageSquare} label="SMS" active={!!number.capabilities?.sms} />
                                    <CapabilityCard icon={ImageIcon} label="MMS" active={!!number.capabilities?.mms} />
                                    <CapabilityCard icon={Printer} label="Fax" active={false} />
                                </div>
                            </div>

                            {/* Action Panel */}
                            <div className="bg-card rounded-3xl border border-border p-10 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-premium-sm transition-all hover:border-slate-900/20 dark:hover:border-white/20">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-3 rounded-full ${isTrafficActive ? 'bg-success shadow-glow-green' : 'bg-muted-foreground/30'}`} />
                                        <p className="text-foreground text-lg font-black tracking-tight">Inbound Traffic Routing</p>
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium max-w-md leading-relaxed">
                                        Toggle this switch to pause or resume all incoming calls to this number. Pausing routing does not affect billing.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsTrafficActive(!isTrafficActive)}
                                    className={`relative flex h-10 w-18 cursor-pointer items-center rounded-full transition-all duration-300 px-1 border-2 ${isTrafficActive ? 'bg-slate-900 dark:bg-white border-transparent' : 'bg-muted border-border'}`}
                                >
                                    <div className={`h-7 w-7 rounded-full ${isTrafficActive ? 'bg-white dark:bg-black' : 'bg-white'} shadow-xl transition-all duration-300 transform ${isTrafficActive ? 'translate-x-8' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Billing */}
                        <div className="space-y-8">
                            <div className="bg-slate-900 dark:bg-white text-white dark:text-black rounded-3xl p-10 shadow-premium-lg relative overflow-hidden flex flex-col min-h-[440px]">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 dark:bg-slate-900/10 rounded-full -mr-48 -mt-48 blur-3xl" />

                                <div className="flex items-center justify-between mb-16 relative z-10">
                                    <h3 className="text-xl font-black tracking-tight">Billing Portfolio</h3>
                                    <div className="bg-white/20 dark:bg-black/20 p-3 rounded-2xl backdrop-blur-md border border-white/20 dark:border-black/20">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="mb-16 relative z-10">
                                    <p className="text-white/60 dark:text-black/60 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Monthly Recurring Rate</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black tracking-tighter">${number.monthly_cost?.toFixed(2) || '2.00'}</span>
                                        <span className="text-white/50 dark:text-black/50 font-black text-sm uppercase tracking-widest">USD / MO</span>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-16 relative z-10">
                                    <div className="flex justify-between items-center group">
                                        <span className="text-white/60 dark:text-black/60 text-xs font-bold uppercase">Next Billing Cycle</span>
                                        <span className="font-black text-sm tracking-tight">{formattedRenewal}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/60 dark:text-black/60 text-xs font-bold uppercase">Status</span>
                                        <span className="font-black text-sm tracking-tight uppercase flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-success animate-pulse" />
                                            Active
                                        </span>
                                    </div>
                                </div>

                                <button className="mt-auto w-full bg-white dark:bg-black text-black dark:text-white font-black uppercase tracking-[0.2em] text-[10px] py-5 rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-xl relative z-10">
                                    Manage Subscription
                                </button>
                            </div>

                            {/* Resources & Actions Card */}
                            <div className="bg-card rounded-3xl border border-border p-10 shadow-premium-sm space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Resources & Actions</h3>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-wider border border-emerald-500/20">Included in Plan</span>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <a href="#" className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-border transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-background rounded-xl border border-border shadow-sm">
                                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                            </div>
                                            <span className="text-xs font-bold text-foreground">Developer Docs</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-all" />
                                    </a>
                                    <a href="#" className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-border transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-background rounded-xl border border-border shadow-sm">
                                                <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                                            </div>
                                            <span className="text-xs font-bold text-foreground">Support Center</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-all" />
                                    </a>
                                </div>

                                <div className="pt-4 border-t border-border/50">
                                    <button className="w-full px-4 py-4 rounded-2xl bg-destructive/5 hover:bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest border border-destructive/10 transition-all">
                                        Release Number
                                    </button>
                                    <p className="text-[9px] text-muted-foreground/60 text-center mt-3 font-medium">Releasing numbers is irreversible and takes immediate effect.</p>
                                </div>
                            </div>

                            <div className="bg-card rounded-3xl border border-border p-8 shadow-premium-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2 bg-warning/10 rounded-xl">
                                        <ShieldAlert className="w-5 h-5 text-warning" />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-widest">System Advisory</h4>
                                </div>
                                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                    Avoid releasing numbers if they are tied to active marketing campaigns. Released numbers may not be retrievable.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Table */}
                    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-premium-sm">
                        <div className="px-10 py-8 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="flex flex-col gap-1 text-center sm:text-left">
                                <h3 className="text-xl font-black text-foreground tracking-tight">Communication Logs</h3>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-60">Verified live traffic activity</p>
                            </div>
                            <div className="flex items-center gap-4">
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
                                        <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Timestamp</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Channel</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Flow</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Counterparty</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Duration</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Settlement</th>
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
                                                <td className="px-10 py-6 text-xs font-bold text-foreground/80 whitespace-nowrap">
                                                    {new Date(log.created_at).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary/5 rounded-xl border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                                            <Phone className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-widest text-foreground">Voice</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${log.direction === 'inbound'
                                                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                        : 'bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white border-slate-900/20 dark:border-white/20'
                                                        }`}>
                                                        {log.direction || 'Inbound'}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 text-xs font-mono font-black text-foreground/70">
                                                    {log.from === number.phone_number ? log.to : log.from}
                                                </td>
                                                <td className="px-10 py-6 text-xs font-bold text-foreground flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                                    {log.duration || '0m 45s'}
                                                </td>
                                                <td className="px-10 py-6 text-xs font-black text-foreground text-right">
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

const CapabilityCard = ({ icon: Icon, label, active }: { icon: any, label: string, active: boolean }) => (
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
