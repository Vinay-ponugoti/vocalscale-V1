import { useEffect, useRef } from 'react';
import { Link2, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { useGoogleBusiness } from '../../../../hooks/useGoogleBusiness';

interface ConnectGoogleBusinessProps {
  // Called once the account is verified (e.g. to trigger an initial sync).
  onVerified?: () => void;
}

export const ConnectGoogleBusiness = ({ onVerified }: ConnectGoogleBusinessProps) => {
  const { loading, isConnected, isVerified, connect, verify, isVerifying } = useGoogleBusiness();
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

  // Fully wired — nothing to show.
  if (loading || isVerified) return null;

  const handleVerify = async () => {
    const res = await verify();
    if (res?.verified) onVerified?.();
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-cyan-100 bg-cyan-50/50 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-100 bg-white text-cyan-700">
          {isConnected ? <AlertTriangle className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
        </div>
        <div>
          <h3 className="text-base font-black tracking-tight text-slate-950">
            {isConnected ? 'Finish connecting Google Business' : 'Connect your Google Business account'}
          </h3>
          <p className="mt-0.5 max-w-xl text-sm font-medium text-slate-600">
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
          className="h-10 shrink-0 gap-2 rounded-md bg-cyan-700 px-5 font-bold text-white hover:bg-cyan-800"
        >
          {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {isVerifying ? 'Verifying...' : 'Verify business'}
        </Button>
      ) : (
        <Button
          onClick={() => connect('reviews')}
          className="h-10 shrink-0 gap-2 rounded-md bg-cyan-700 px-5 font-bold text-white hover:bg-cyan-800"
        >
          <Link2 className="h-4 w-4" />
          Connect Google Business
        </Button>
      )}
    </div>
  );
};
