import { useState, useEffect, useCallback } from 'react';
import { Calendar, Unlink, CheckCircle, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { env } from '../../../../config/env';
import { api, getAuthHeader } from '../../../../lib/api';

// Internal Component: Premium Toggle Switch
const Toggle: React.FC<{ active: boolean; onChange: () => void; disabled?: boolean; size?: 'sm' | 'md' }> = ({ active, onChange, disabled, size = 'md' }) => {
    const baseClasses = "relative inline-flex items-center rounded-full transition-colors focus:outline-none";
    const sizeClasses = size === 'sm' ? "h-5 w-9" : "h-6 w-11";
    const colorClasses = active ? 'bg-indigo-600' : 'bg-slate-200';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
        <button
            type="button"
            onClick={onChange}
            disabled={disabled}
            className={`${baseClasses} ${sizeClasses} ${colorClasses} ${disabledClasses}`}
        >
            <span
                className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
                    } transform bg-white rounded-full transition-transform ease-in-out duration-200 shadow-sm ${active ? (size === 'sm' ? 'translate-x-5' : 'translate-x-6') : 'translate-x-1'
                    }`}
            />
        </button>
    );
};

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
    const [modalOpen, setModalOpen] = useState(false);
    const [itemToDisconnect, setItemToDisconnect] = useState<'calendar' | 'reviews' | null>(null);
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
    }, []);

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

    const handleDisconnectClick = (feature: 'calendar' | 'reviews') => {
        setItemToDisconnect(feature);
        setModalOpen(true);
    };

    const confirmDisconnect = async () => {
        if (!itemToDisconnect) return;
        const feature = itemToDisconnect;

        setDisconnecting(feature);
        setModalOpen(false); // Close modal immediately to show loading state on toggle if preferred, or keep open. Let's close and show loading.
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
            setItemToDisconnect(null);
        }
    };

    const handleToggle = (feature: 'calendar' | 'reviews', isConnected: boolean) => {
        if (isConnected) {
            handleDisconnectClick(feature);
        } else {
            handleConnect(feature);
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
            <div className={`p-6 rounded-2xl border transition-all ${isCalendarConnected ? 'bg-white border-slate-200' : 'bg-white border-slate-200'}`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-3 rounded-xl ${isCalendarConnected
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'bg-slate-50 text-slate-400'
                            }`}>
                            <Calendar size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-bold text-slate-900">Google Calendar</h3>
                            </div>
                            <p className="text-slate-500 text-sm max-w-sm">
                                Automatically sync your appointments to Google Calendar.
                            </p>
                        </div>
                    </div>
                    {/* Master Toggle */}
                    <div className="flex items-center gap-3">
                        {connecting === 'calendar' || disconnecting === 'calendar' ? (
                            <RefreshCw size={20} className="text-indigo-600 animate-spin" />
                        ) : (
                            <Toggle
                                active={!!isCalendarConnected}
                                onChange={() => handleToggle('calendar', !!isCalendarConnected)}
                            />
                        )}
                    </div>
                </div>

                {isCalendarConnected && (
                    <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Auto Sync Sub-setting */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">Auto-Sync</span>
                                <span className="text-xs text-slate-500">Add booked appointments to calendar automatically</span>
                            </div>
                            <Toggle
                                active={syncEnabled}
                                onChange={handleSyncToggle}
                                disabled={syncUpdating}
                                size="sm"
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <div className="flex gap-4 text-slate-500">
                                {status.lastSyncedAt && <span>Last synced: {formatDate(status.lastSyncedAt)}</span>}
                            </div>
                            <a
                                href="https://calendar.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
                            >
                                Open Calendar
                                <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Google Reviews Card */}
            <div className={`p-6 rounded-2xl border transition-all ${isReviewsConnected ? 'bg-white border-slate-200' : 'bg-white border-slate-200'}`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-3 rounded-xl ${isReviewsConnected
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'bg-slate-50 text-slate-400'
                            }`}>
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-bold text-slate-900">Google Reviews</h3>
                            </div>
                            <p className="text-slate-500 text-sm max-w-sm">
                                Read and reply to your Google Business reviews.
                            </p>
                        </div>
                    </div>
                    {/* Master Toggle */}
                    <div className="flex items-center gap-3">
                        {connecting === 'reviews' || disconnecting === 'reviews' ? (
                            <RefreshCw size={20} className="text-indigo-600 animate-spin" />
                        ) : (
                            <Toggle
                                active={!!isReviewsConnected}
                                onChange={() => handleToggle('reviews', !!isReviewsConnected)}
                            />
                        )}
                    </div>
                </div>

                {isReviewsConnected && (
                    <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        {status.reviewsVerified ? (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg w-fit">
                                <CheckCircle size={14} />
                                <span className="text-xs font-bold">Business Profile Verified</span>
                            </div>
                        ) : (
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800 flex items-start gap-2">
                                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="font-bold block mb-0.5">Verification Needed</span>
                                    We could not verify a Business Profile. Ensure this account manages a business.
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Simple Info Footer */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="text-xs text-slate-500 leading-relaxed">
                    <p>Connecting connects your Google Account for distinct features:</p>
                    <ul className="list-disc ml-4 mt-1 space-y-0.5">
                        <li>Calendar: Syncs appointments two-way.</li>
                        <li>Reviews: Fetches reviews and allows AI replies.</li>
                    </ul>
                </div>
            </div>

            {/* Disconnect Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all scale-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                <Unlink size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Disconnect Integration?</h3>
                                <p className="text-xs text-slate-500">Stop syncing data</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-6">
                            Are you sure you want to disconnect <strong>Google {itemToDisconnect === 'calendar' ? 'Calendar' : 'Reviews'}</strong>?
                            This will stop all sync features immediately.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDisconnect}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-red-200"
                            >
                                Disconnect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntegrationsContent;
