import { useState, useEffect, useCallback } from 'react';
import { Calendar, Link, Unlink, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { env } from '../../../../config/env';
import { getAuthHeader } from '../../../../lib/api';

interface GoogleCalendarStatus {
    connected: boolean;
    connectedAt?: string;
    lastSyncedAt?: string;
}

const IntegrationsContent = () => {
    const [status, setStatus] = useState<GoogleCalendarStatus>({ connected: false });
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${env.API_URL}/integrations/google-calendar/status`, {
                headers,
            });
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            }
        } catch (err) {
            console.error('Failed to fetch Google Calendar status:', err);
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    // Handle OAuth callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const oauthError = urlParams.get('error');

        if (code && state) {
            handleOAuthCallback(code, state);
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        } else if (oauthError) {
            setError('Authorization was denied. Please try again.');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const handleOAuthCallback = async (code: string, state: string) => {
        setConnecting(true);
        setError(null);
        try {
            const headers = await getAuthHeader();
            const response = await fetch(
                `${env.API_URL}/integrations/google-calendar/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
                { headers }
            );
            if (response.ok) {
                await fetchStatus();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to connect Google Calendar');
            }
        } catch (err) {
            setError('Failed to connect. Please try again.');
            console.error('OAuth callback error:', err);
        } finally {
            setConnecting(false);
        }
    };

    const handleConnect = async () => {
        setConnecting(true);
        setError(null);
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${env.API_URL}/integrations/google-calendar/connect`, {
                method: 'POST',
                headers,
            });
            if (response.ok) {
                const data = await response.json();
                if (data.authUrl) {
                    // Redirect to Google OAuth
                    window.location.href = data.authUrl;
                }
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to initiate connection');
                setConnecting(false);
            }
        } catch (err) {
            setError('Failed to connect. Please try again.');
            setConnecting(false);
            console.error('Connect error:', err);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect Google Calendar? Future appointments will no longer sync automatically.')) {
            return;
        }
        setDisconnecting(true);
        setError(null);
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${env.API_URL}/integrations/google-calendar/disconnect`, {
                method: 'DELETE',
                headers,
            });
            if (response.ok) {
                setStatus({ connected: false });
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to disconnect');
            }
        } catch (err) {
            setError('Failed to disconnect. Please try again.');
            console.error('Disconnect error:', err);
        } finally {
            setDisconnecting(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Google Calendar Integration Card */}
            <div className={`p-6 rounded-2xl border-2 transition-all ${status.connected
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-slate-50 border-slate-200 hover:border-indigo-200'
                }`}>
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${status.connected
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-white text-slate-400 border border-slate-200'
                        }`}>
                        <Calendar size={24} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-black text-slate-900">Google Calendar</h3>
                            {status.connected && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                    <CheckCircle size={10} />
                                    Connected
                                </span>
                            )}
                        </div>

                        <p className="text-slate-500 text-sm mb-4">
                            {status.connected
                                ? 'Appointments sync automatically to your Google Calendar when created or updated.'
                                : 'Connect your Google Calendar to sync appointments automatically.'}
                        </p>

                        {status.connected && (
                            <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4">
                                {status.connectedAt && (
                                    <span>Connected: {formatDate(status.connectedAt)}</span>
                                )}
                                {status.lastSyncedAt && (
                                    <span>Last synced: {formatDate(status.lastSyncedAt)}</span>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                            {status.connected ? (
                                <>
                                    <a
                                        href="https://calendar.google.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                                    >
                                        <ExternalLink size={14} />
                                        Open Calendar
                                    </a>
                                    <button
                                        onClick={handleDisconnect}
                                        disabled={disconnecting}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                                    >
                                        {disconnecting ? (
                                            <RefreshCw size={14} className="animate-spin" />
                                        ) : (
                                            <Unlink size={14} />
                                        )}
                                        {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleConnect}
                                    disabled={connecting}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
                                >
                                    {connecting ? (
                                        <RefreshCw size={14} className="animate-spin" />
                                    ) : (
                                        <Link size={14} />
                                    )}
                                    {connecting ? 'Connecting...' : 'Connect Google Calendar'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <h4 className="text-sm font-bold text-blue-800 mb-1">How it works</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>• New appointments created in the dashboard sync to Google Calendar</li>
                    <li>• Drag-and-drop time changes update Google Calendar automatically</li>
                    <li>• Appointments booked via AI voice calls sync to Google Calendar</li>
                    <li>• You can view synced appointments directly in Google Calendar</li>
                </ul>
            </div>
        </div>
    );
};

export default IntegrationsContent;
