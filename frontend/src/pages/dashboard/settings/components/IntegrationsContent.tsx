import { useState, useEffect, useCallback } from 'react';
import { Calendar, Link, Unlink, CheckCircle, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { env } from '../../../../config/env';
import { api, getAuthHeader } from '../../../../lib/api';

// Internal Component: Simple Toggle
const Toggle: React.FC<{ active: boolean; onChange: () => void; disabled?: boolean }> = ({ active, onChange, disabled }) => (
    <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`w-11 h-6 rounded-full p-1 transition-all duration-200 ease-out focus:outline-none ${active ? 'bg-indigo-600' : 'bg-slate-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
        <div
            className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-out ${active ? 'translate-x-5' : 'translate-x-0'}`}
        />
    </button>
);

interface GoogleCalendarStatus {
    connected: boolean;
    connectedAt?: string;
    lastSyncedAt?: string;
    reviewsVerified?: boolean;
    businessAccountId?: string | null;
}

const IntegrationsContent = () => {
    const [status, setStatus] = useState<GoogleCalendarStatus>({ connected: false });
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [syncEnabled, setSyncEnabled] = useState(true);
    const [syncUpdating, setSyncUpdating] = useState(false);

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
        // Fetch voice settings for sync status
        api.getVoiceSettings().then(settings => {
            if (settings && typeof settings.sync_google_calendar === 'boolean') {
                setSyncEnabled(settings.sync_google_calendar);
            }
        }).catch(err => console.error('Failed to fetch voice settings for sync status:', err));
    }, [fetchStatus]);

    const handleSyncToggle = async () => {
        if (syncUpdating) return;
        setSyncUpdating(true);
        const newState = !syncEnabled;
        setSyncEnabled(newState); // Optimistic update
        try {
            await api.updateVoiceSettings({ sync_google_calendar: newState });
        } catch (err) {
            console.error('Failed to update sync settings:', err);
            setSyncEnabled(!newState); // Revert on error
            setError('Failed to update sync settings');
        } finally {
            setSyncUpdating(false);
        }
    };

    // Handle redirect from OAuth callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const gcalParam = urlParams.get('gcal');
        const errorParam = urlParams.get('error');

        if (gcalParam === 'connected') {
            // Refresh status after successful connection
            fetchStatus();
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        } else if (errorParam) {
            const errorMessages: Record<string, string> = {
                'auth_denied': 'Authorization was denied. Please try again.',
                'invalid_request': 'Invalid request. Please try again.',
                'token_exchange_failed': 'Failed to exchange authorization code. Please try again.',
                'save_failed': 'Failed to save connection. Please try again.',
            };
            setError(errorMessages[errorParam] || 'An error occurred. Please try again.');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [fetchStatus]);

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
                            <h3 className="text-base font-black text-slate-900">Google Account</h3>
                            {status.connected && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                    <CheckCircle size={10} />
                                    Connected
                                </span>
                            )}
                        </div>

                        <p className="text-slate-500 text-sm mb-4">
                            {status.connected
                                ? 'Your Google account is connected for Calendar and Reviews.'
                                : 'Connect your Google account to sync appointments and manage reviews.'}
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

                        {/* Reviews Status */}
                        {status.connected && (
                            <div className="mb-5 p-3 bg-white/50 rounded-lg border border-slate-200">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-slate-700">Google Reviews</span>
                                    {status.reviewsVerified ? (
                                        <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase">
                                            <CheckCircle size={10} /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-amber-600 text-[10px] font-bold uppercase">
                                            <AlertCircle size={10} /> Not Verified
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-500">
                                    {status.reviewsVerified
                                        ? 'We can access and reply to your business reviews.'
                                        : 'We could not verify a Business Profile with this account.'}
                                </p>
                            </div>
                        )}

                        {/* Sync Toggle */}
                        {status.connected && (
                            <div className="flex items-center gap-3 mb-5 p-3 bg-white/50 rounded-lg border border-emerald-100/50">
                                <Toggle active={syncEnabled} onChange={handleSyncToggle} disabled={syncUpdating} />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">Auto-Sync Appointments</span>
                                    <span className="text-[10px] text-slate-500">Automatically add booked appointments to this calendar</span>
                                </div>
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
                                    {connecting ? 'Connecting...' : 'Connect Google Account'}
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
                    <li>• Reply to Google Reviews directly from your dashboard (if verified)</li>
                    <li>• You can view synced appointments directly in Google Calendar</li>
                </ul>
            </div>
        </div >
    );
};

export default IntegrationsContent;
