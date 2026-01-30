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
                // Filter logs for this specific number (matching either from or to)
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!number) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <ShieldAlert className="w-12 h-12 text-slate-400" />
                    <h2 className="text-xl font-bold text-slate-900">Number Not Found</h2>
                    <button
                        onClick={() => navigate('/dashboard/voice-setup')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold"
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
            <main className="flex-1 flex flex-col overflow-y-auto bg-[#f6f7f8] dark:bg-[#111c21] min-h-screen">
                {/* Top Header */}
                <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-8">
                        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Number Details</h2>
                        <div className="hidden md:flex items-center gap-6">
                            <a href="#" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Docs</a>
                            <a href="#" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Support</a>
                            <div className="flex items-center gap-1.5">
                                <div className="size-2 rounded-full bg-green-500"></div>
                                <span className="text-slate-500 text-sm font-medium">System Status</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-700">
                            <Search className="text-slate-400 w-4 h-4" />
                            <input
                                className="bg-transparent border-none focus:ring-0 text-sm w-40 dark:text-white placeholder-slate-400"
                                placeholder="Search SIDs..."
                                type="text"
                            />
                        </div>
                        <button className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition-all border border-red-100 dark:border-red-900/30">
                            Release Number
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto w-full">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 mb-4 text-sm font-medium">
                        <Link to="/dashboard/voice-setup" className="text-slate-500 hover:text-indigo-600 transition-colors capitalize">Phone Numbers</Link>
                        <ChevronRight className="text-slate-400 w-4 h-4" />
                        <span className="text-indigo-600 font-bold">{number.phone_number}</span>
                    </nav>

                    {/* Page Heading */}
                    <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{number.phone_number}</h1>
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${number.status === 'active'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {number.status || 'Active'}
                                </span>
                            </div>
                            <p className="text-slate-500 text-lg font-medium">{number.friendly_name || 'Marketing Line — California, US'}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/dashboard/voice-setup')}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all shadow-sm group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                Back to List
                            </button>
                            <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all">
                                <Settings className="w-4 h-4" />
                                Configure
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: General Info & Actions */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                <h3 className="text-lg font-bold mb-8 text-slate-900 dark:text-white">General Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Type</p>
                                        <p className="text-base font-bold text-slate-900 dark:text-white">Local (10-Digit)</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Origin</p>
                                        <p className="text-base font-bold text-slate-900 dark:text-white">United States</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Account SID</p>
                                        <p className="text-base font-mono font-bold text-indigo-600 truncate">{number.id.substring(0, 16)}...</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Purchased On</p>
                                        <p className="text-base font-bold text-slate-900 dark:text-white">{formattedDate}</p>
                                    </div>
                                </div>

                                <div className="my-10 h-px bg-slate-100 dark:bg-slate-800" />

                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6">Capabilities</h4>
                                <div className="flex flex-wrap gap-4">
                                    <CapabilityBadge icon={Mic} label="Voice" active={!!number.capabilities?.voice} />
                                    <CapabilityBadge icon={MessageSquare} label="SMS" active={!!number.capabilities?.sms} />
                                    <CapabilityBadge icon={ImageIcon} label="MMS" active={!!number.capabilities?.mms} />
                                    <CapabilityBadge icon={Printer} label="Fax" active={false} />
                                </div>
                            </div>

                            {/* Action Panel */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                                <div className="flex flex-col gap-1">
                                    <p className="text-slate-900 dark:text-white text-base font-bold">Inbound Traffic Status</p>
                                    <p className="text-slate-500 text-sm font-medium max-w-md">This phone number is currently active and receiving traffic. Toggle to pause incoming calls.</p>
                                </div>
                                <button
                                    onClick={() => setIsTrafficActive(!isTrafficActive)}
                                    className={`relative flex h-8 w-14 cursor-pointer items-center rounded-full transition-all border-2 border-transparent focus:outline-none ${isTrafficActive ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <div className={`h-6 w-6 rounded-full bg-white shadow-md transition-all ${isTrafficActive ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Billing */}
                        <div className="space-y-6">
                            <div className="bg-indigo-600 dark:bg-indigo-700 text-white rounded-2xl p-8 shadow-xl shadow-indigo-200 dark:shadow-none h-full flex flex-col">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-lg font-bold">Billing & Pricing</h3>
                                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="mb-10">
                                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Monthly Recurring Cost</p>
                                    <div className="flex items-baseline gap-1.5 mt-1">
                                        <span className="text-5xl font-black">${number.monthly_cost?.toFixed(2) || '2.00'}</span>
                                        <span className="text-indigo-100/70 font-bold">/ month</span>
                                    </div>
                                </div>

                                <div className="space-y-5 mb-10">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-indigo-100/70 font-medium">Renewal Date</span>
                                        <span className="font-black tracking-tight">{formattedRenewal}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-indigo-100/70 font-medium">Payment Method</span>
                                        <span className="font-black tracking-tight uppercase">Visa •••• 4242</span>
                                    </div>
                                    <div className="h-px bg-white/10 w-full" />
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-indigo-100/70 font-medium font-bold">YTD Spend</span>
                                        <span className="font-black tracking-tight">$24.00</span>
                                    </div>
                                </div>

                                <button className="mt-auto w-full bg-white text-indigo-600 font-black uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-slate-50 transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0">
                                    Renew Immediately
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Activity Table */}
                    <div className="mt-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                                <p className="text-xs font-medium text-slate-400 mt-1">Live updates for calls and messages on this line</p>
                            </div>
                            <Link to="/dashboard/calls" className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:text-indigo-700 transition-colors flex items-center gap-2">
                                View Full Logs
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Direction</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">From/To</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {logsLoading ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Logs...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : logs.length > 0 ? (
                                        logs.map((log, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-8 py-5 text-sm font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                                            <Phone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">Voice</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${log.direction === 'inbound'
                                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                                                            : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20'
                                                        }`}>
                                                        {log.direction || 'Inbound'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-sm font-mono font-bold text-slate-600 dark:text-slate-400">
                                                    {log.from === number.phone_number ? log.to : log.from}
                                                </td>
                                                <td className="px-8 py-5 text-sm font-bold text-slate-900 dark:text-white">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        {log.duration || '2m 14s'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-white text-right">
                                                    ${log.cost?.toFixed(4) || '0.0170'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-16 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center opacity-40">
                                                        <Clock className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">No Recent Activity</p>
                                                        <p className="text-xs font-medium text-slate-400">Activity logs will appear here as they occur</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="mt-12 py-10 border-t border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
                            © 2024 VocalScale Cloud. All rates are in USD.
                        </p>
                    </footer>
                </div>
            </main>
        </DashboardLayout>
    );
};

const CapabilityBadge = ({ icon: Icon, label, active }: { icon: any, label: string, active: boolean }) => (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all ${active
            ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900/50 shadow-sm'
            : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
        }`}>
        <div className={`p-1.5 rounded-lg ${active ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
            {active ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
                <XCircle className="w-4 h-4 text-slate-400" />
            )}
        </div>
        <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
            <span className={`text-sm font-bold ${active ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{label}</span>
        </div>
    </div>
);

export default NumberDetails;
