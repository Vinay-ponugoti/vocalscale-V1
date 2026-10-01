import { useEffect, useRef } from 'react';
import { Link2, CheckCircle2, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { useGoogleBusiness } from '../../../../hooks/useGoogleBusiness';

interface ConnectGoogleBusinessProps {
  // Called once the account is verified (e.g. to trigger an initial sync).
  onVerified?: () => void;
}

export const ConnectGoogleBusiness = ({ onVerified }: ConnectGoogleBusinessProps) => {
  const { status, loading, isConnected, isVerified, connect, verify, isVerifying } = useGoogleBusiness();
  const handledCallback = useRef(false);

  // Handle the OAuth return (?gbp=connected): verify the account, then sync.
  useEffect(() => {
    if (handledCallback.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('gbp') === 'connected') {
      handledCallback.current = true;
      window.history.replaceState({}, '', window.location.pathname);
      verify()
        .then((res) => {
          if (res?.verified) onVerified?.();
        })
        .catch(() => {});
    }
  }, [verify, onVerified]);

  if (loading) return null;

  if (isVerified) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-white text-emerald-600">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-950">Google Business connected</p>
              {status?.demoMode && (
                <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-blue-600">Local demo data</span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
              Reviews are stored locally and shaped like Google Business Profile data.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
          <RefreshCw className="h-3.5 w-3.5" />
          {status?.lastSyncedAt ? `Synced ${new Date(status.lastSyncedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}` : 'Ready to sync'}
        </div>
      </div>
    );
  }

  const handleVerify = async () => {
    const res = await verify();
    if (res?.verified) onVerified?.();
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100">
          {isConnected ? <AlertTriangle className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        </span>
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-950">
            {isConnected ? 'Finish connecting Google Business' : 'Connect your Google Business account'}
          </h3>
          <p className="mt-0.5 max-w-xl text-sm text-slate-600">
            {isConnected
              ? 'Google is linked, but we still need to verify which business location to manage.'
              : 'Sign in with the Google account that manages your Business Profile to pull in reviews and reply to them.'}
          </p>
        </div>
      </div>

      {isConnected ? (
        <Button
          onClick={handleVerify}
          disabled={isVerifying}
          className="shrink-0"
        >
          {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {isVerifying ? 'Verifying…' : 'Verify business'}
        </Button>
      ) : (
        <Button
          onClick={() => connect('reviews')}
          className="shrink-0"
        >
          <Link2 className="h-4 w-4" />
          Connect Google Business
        </Button>
      )}
    </div>
  );
};
