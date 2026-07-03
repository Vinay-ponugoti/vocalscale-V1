import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Calendar, CheckCircle, ExternalLink, MessageSquareText, RefreshCw, Unlink } from 'lucide-react';
import { env } from '../../../../config/env';
import { api, getAuthHeader } from '../../../../lib/api';

const Toggle: React.FC<{ active: boolean; onChange: () => void; disabled?: boolean; size?: 'sm' | 'md' }> = ({
    active,
    onChange,
    disabled,
    size = 'md'
}) => {
    const sizeClasses = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
    const knobClasses = size === 'sm'
        ? active ? 'translate-x-5 h-3 w-3' : 'translate-x-1 h-3 w-3'
        : active ? 'translate-x-6 h-4 w-4' : 'translate-x-1 h-4 w-4';

    return (
        <button
            type="button"
            onClick={onChange}
            disabled={disabled}
            className={`relative inline-flex items-center rounded-full transition focus:outline-none ${sizeClasses} ${active ? 'bg-cyan-600' : 'bg-slate-200'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
            <span className={`transform rounded-full bg-white shadow-sm transition ${knobClasses}`} />
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
        setSyncEnabled(newState);
        try {
            await api.updateVoiceSettings({ sync_google_calendar: newState });
        } catch (err) {
            console.error('Failed to update sync settings:', err);
            setSyncEnabled(!newState);
            setError('Failed to update sync settings');
        } finally {
            setSyncUpdating(false);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const gcalParam = urlParams.get('gcal');
        const errorParam = urlParams.get('error');

        if (gcalParam === 'connected') {
            fetchStatus();
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
            const response = await fetch(`${env.API_URL}/integrations/google-calendar/connect?feature=${feature}`, {
                method: 'POST',
                headers,
            });
            if (response.ok) {
                const data = await response.json();
                if (data.authUrl) {
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
        setModalOpen(false);
        setError(null);

        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${env.API_URL}/integrations/google-calendar/disconnect?feature=${feature}`, {
                method: 'DELETE',
                headers,
            });
            if (response.ok) {
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
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-600/30 border-t-cyan-600" />
            </div>
        );
    }

    const isCalendarConnected = status.connected && status.calendarEnabled;
    const isReviewsConnected = status.connected && status.reviewsEnabled;

    return (
        <div className="space-y-5">
            {error && (
                <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-700">
                    {error}
                </div>
            )}

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${isCalendarConnected ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-950">Google Calendar</h3>
                                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">Sync booked appointments to your calendar.</p>
                            </div>
                        </div>
                        {connecting === 'calendar' || disconnecting === 'calendar' ? (
                            <RefreshCw className="h-5 w-5 animate-spin text-cyan-600" />
                        ) : (
                            <Toggle
                                active={!!isCalendarConnected}
                                onChange={() => handleToggle('calendar', !!isCalendarConnected)}
                            />
                        )}
                    </div>

                    {isCalendarConnected && (
                        <div className="mt-5 border-t border-slate-200 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-950">Auto-sync appointments</p>
                                    <p className="mt-1 text-xs font-medium text-slate-500">Add new bookings automatically.</p>
                                </div>
                                <Toggle
                                    active={syncEnabled}
                                    onChange={handleSyncToggle}
                                    disabled={syncUpdating}
                                    size="sm"
                                />
                            </div>

                            <div className="mt-4 flex flex-col gap-2 text-xs font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                                <span>{status.lastSyncedAt ? `Last synced: ${formatDate(status.lastSyncedAt)}` : 'No sync activity yet'}</span>
                                <a
                                    href="https://calendar.google.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 font-semibold text-cyan-700 hover:text-cyan-800"
                                >
                                    Open Calendar
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${isReviewsConnected ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                                <MessageSquareText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-950">Google Reviews</h3>
                                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">Connect reviews for monitoring and replies.</p>
                            </div>
                        </div>
                        {connecting === 'reviews' || disconnecting === 'reviews' ? (
                            <RefreshCw className="h-5 w-5 animate-spin text-cyan-600" />
                        ) : (
                            <Toggle
                                active={!!isReviewsConnected}
                                onChange={() => handleToggle('reviews', !!isReviewsConnected)}
                            />
                        )}
                    </div>

                    {isReviewsConnected && (
                        <div className="mt-5 border-t border-slate-200 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            {status.reviewsVerified ? (
                                <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                                    <CheckCircle className="h-4 w-4" />
                                    Business Profile verified
                                </div>
                            ) : (
                                <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <div>
                                        <p className="font-semibold">Verification needed</p>
                                        <p className="mt-1 font-medium">Use a Google account that manages this Business Profile.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 text-slate-400" />
                <div className="text-sm font-medium leading-6 text-slate-500">
                    <p>Each Google feature can be connected separately. Calendar handles appointment sync; Reviews handles Business Profile review access.</p>
                </div>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)} />
                    <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                <Unlink className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-950">Disconnect integration?</h3>
                                <p className="text-sm font-medium text-slate-500">Sync will stop immediately.</p>
                            </div>
                        </div>

                        <p className="mb-6 text-sm leading-6 text-slate-600">
                            Disconnect Google {itemToDisconnect === 'calendar' ? 'Calendar' : 'Reviews'} from this workspace?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDisconnect}
                                className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
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
