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
    calendarEnabled?: boolean;
    reviewsEnabled?: boolean;
}

const IntegrationsContent = () => {
    const [status, setStatus] = useState<GoogleCalendarStatus>({ connected: false });
    const [loading, setLoading] = useState(true);
    // Track which feature is processing
    const [connecting, setConnecting] = useState<string | null>(null);
    const [disconnecting, setDisconnecting] = useState<string | null>(null);
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

    const handleConnect = async (feature: 'calendar' | 'reviews') => {
        setConnecting(feature);
        setError(null);
        try {
            const headers = await getAuthHeader();
            // Pass feature param
            const response = await fetch(`${env.API_URL}/integrations/google-calendar/connect?feature=${feature}`, {
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
                setConnecting(null);
            }
        } catch (err) {
            setError('Failed to connect. Please try again.');
            setConnecting(null);
            console.error('Connect error:', err);
        }
    };

    const handleDisconnect = async (feature: 'calendar' | 'reviews') => {
        if (!confirm(`Are you sure you want to disconnect Google ${feature === 'calendar' ? 'Calendar' : 'Reviews'}?`)) {
            return;
        }
        setDisconnecting(feature);
        setError(null);
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${env.API_URL}/integrations/google-calendar/disconnect?feature=${feature}`, {
                method: 'DELETE',
                headers,
            });
            if (response.ok) {
                // Refresh full status to reflect partial disconnect
                await fetchStatus();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to disconnect');
            }
        } catch (err) {
            setError('Failed to disconnect. Please try again.');
            console.error('Disconnect error:', err);
        } finally {
            setDisconnecting(null);
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

    const isCalendarConnected = status.connected && status.calendarEnabled;
    const isReviewsConnected = status.connected && status.reviewsEnabled;

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Google Calendar Card */}
            <div className={`p-6 rounded-2xl border-2 transition-all ${isCalendarConnected
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-slate-50 border-slate-200 hover:border-indigo-200'
                }`}>
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${isCalendarConnected
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-white text-slate-400 border border-slate-200'
                        }`}>
                        <Calendar size={24} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-black text-slate-900">Google Calendar</h3>
                            {isCalendarConnected && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                    <CheckCircle size={10} />
                                    Connected
                                </span>
                            )}
                        </div>

                        <p className="text-slate-500 text-sm mb-4">
                            {isCalendarConnected
                                ? 'Appointments sync automatically to your Google Calendar.'
                                : 'Connect your Google account to sync appointments automatically.'}
                        </p>

                        {isCalendarConnected ? (
                            <>
                                <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4">
                                    {status.connectedAt && (
                                        <span>Connected: {formatDate(status.connectedAt)}</span>
                                    )}
                                    {status.lastSyncedAt && (
                                        <span>Last synced: {formatDate(status.lastSyncedAt)}</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 mb-5 p-3 bg-white/50 rounded-lg border border-emerald-100/50">
                                    <Toggle active={syncEnabled} onChange={handleSyncToggle} disabled={syncUpdating} />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700">Auto-Sync Appointments</span>
                                        <span className="text-[10px] text-slate-500">Automatically add booked appointments to this calendar</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
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
                                        onClick={() => handleDisconnect('calendar')}
                                        disabled={disconnecting === 'calendar'}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                                    >
                                        {disconnecting === 'calendar' ? (
                                            <RefreshCw size={14} className="animate-spin" />
                                        ) : (
                                            <Unlink size={14} />
                                        )}
                                        {disconnecting === 'calendar' ? 'Disconnecting...' : 'Disconnect'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => handleConnect('calendar')}
                                disabled={connecting === 'calendar'}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
                            >
                                {connecting === 'calendar' ? (
                                    <RefreshCw size={14} className="animate-spin" />
                                ) : (
                                    <Link size={14} />
                                )}
                                {connecting === 'calendar' ? 'Connecting...' : 'Connect Google Calendar'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Google Reviews Card */}
            <div className={`p-6 rounded-2xl border-2 transition-all ${isReviewsConnected
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-slate-50 border-slate-200 hover:border-indigo-200'
                }`}>
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${isReviewsConnected
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-white text-slate-400 border border-slate-200'
                        }`}>
                        <AlertCircle size={24} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-black text-slate-900">Google Reviews</h3>
                            {isReviewsConnected && status.reviewsVerified && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                    <CheckCircle size={10} />
                                    Active
                                </span>
                            )}
                        </div>

                        <p className="text-slate-500 text-sm mb-4">
                            {isReviewsConnected
                                ? status.reviewsVerified
                                    ? 'We can access and reply to your business reviews.'
                                    : 'Connect a verified Google Business Profile to manage reviews.'
                                : 'Connect your Google account to manage reviews.'}
                        </p>

                        {!isReviewsConnected ? (
                            <button
                                onClick={() => handleConnect('reviews')}
                                disabled={connecting === 'reviews'}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
                            >
                                {connecting === 'reviews' ? (
                                    <RefreshCw size={14} className="animate-spin" />
                                ) : (
                                    <Link size={14} />
                                )}
                                {connecting === 'reviews' ? 'Connecting...' : 'Connect Google Reviews'}
                            </button>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {status.reviewsVerified ? (
                                    <div className="p-3 bg-white/50 rounded-lg border border-emerald-100/50">
                                        <p className="text-xs text-slate-600">
                                            Everything is set up! New reviews will appear in your dashboard.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800">
                                        <div className="flex items-center gap-2 font-bold mb-1">
                                            <AlertCircle size={14} />
                                            Verification Needed
                                        </div>
                                        We could not verify a Business Profile with this account. Please ensure your Google account manages a verified business.
                                    </div>
                                )}
                                <div className="mt-2">
                                    <button
                                        onClick={() => handleDisconnect('reviews')}
                                        disabled={disconnecting === 'reviews'}
                                        className="text-xs text-red-500 hover:text-red-700 hover:underline"
                                    >
                                        Disconnect Google Reviews
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <h4 className="text-sm font-bold text-blue-800 mb-1">How it works</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Connecting either card links your Google Account for that specific feature</li>
                    <li>• New appointments created in the dashboard sync to Google Calendar</li>
                    <li>• Drag-and-drop time changes update Google Calendar automatically</li>
                    <li>• Appointments booked via AI voice calls sync to Google Calendar</li>
                    <li>• Verified businesses can reply to Google Reviews from the dashboard</li>
                </ul>
            </div>
        </div>
    );
};

export default IntegrationsContent;
