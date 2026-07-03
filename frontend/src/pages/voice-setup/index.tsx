import { useMemo, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import {
  Plus,
  Smartphone,
  Search,
  Phone,
  Settings2,
  X,
  Loader2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePhoneNumbers } from '../../hooks/usePhoneNumbers';
import { env } from '../../config/env';
import { getAuthHeader } from '../../lib/api';

import type { PhoneNumber } from '../../types/voice';

type TelephonyProvider = 'signalwire' | 'telnyx';

const PROVIDERS: Array<{ id: TelephonyProvider; label: string; short: string }> = [
  { id: 'signalwire', label: 'SignalWire', short: 'SW' },
  { id: 'telnyx', label: 'Telnyx', short: 'TX' }
];

const VoiceSetup = () => {
  const navigate = useNavigate();
  const { numbers, loading, error, refetch, updateLocalNumber, setNumbers } = usePhoneNumbers();

  const [editingNumber, setEditingNumber] = useState<PhoneNumber | null>(null);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncProvider, setSyncProvider] = useState<TelephonyProvider>('signalwire');
  const [searchQuery, setSearchQuery] = useState('');

  const providerCounts = useMemo(() => {
    return numbers.reduce<Record<TelephonyProvider, number>>((acc, number) => {
      const provider = number.provider === 'telnyx' ? 'telnyx' : 'signalwire';
      acc[provider] += 1;
      return acc;
    }, { signalwire: 0, telnyx: 0 });
  }, [numbers]);

  const filteredNumbers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return numbers;

    return numbers.filter((number) => {
      const provider = number.provider === 'telnyx' ? 'telnyx' : 'signalwire';
      return [
        number.phone_number,
        number.phoneNumber,
        number.friendly_name,
        number.number,
        number.status,
        provider
      ].some((value) => value?.toLowerCase().includes(query));
    });
  }, [numbers, searchQuery]);

  const activeCount = numbers.filter((number) => number.status === 'active').length;
  const syncProviderLabel = PROVIDERS.find((provider) => provider.id === syncProvider)?.label || 'Provider';

  const handleEditClick = (num: PhoneNumber, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNumber(num);
    setEditName(num.friendly_name || num.number || num.phone_number);
  };

  const handleSaveEdit = async () => {
    if (!editingNumber) return;

    setIsSaving(true);
    try {
      const headers = await getAuthHeader();

      const response = await fetch(`${env.API_URL}/phone-numbers/${editingNumber.id}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          friendly_name: editName
        })
      });

      if (response.ok) {
        updateLocalNumber(editingNumber.id, { number: editName, friendly_name: editName });
        setEditingNumber(null);
      } else {
        console.error('Failed to update number');
      }
    } catch (e) {
      console.error('Error updating number', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncFromProvider = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${env.API_URL}/phone-numbers/sync`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider: syncProvider })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to sync phone numbers');
      }

      const data = await response.json();
      const summary = data.summary || {};
      const recoveredCount = summary.recovered_count || 0;
      const totalInProvider = summary.total_in_provider || 0;
      const totalInDatabase = summary.total_in_database || 0;
      const failedCount = summary.failed_count || 0;

      if (recoveredCount > 0) {
        setSyncMessage(`Successfully recovered ${recoveredCount} ${syncProviderLabel} phone number${recoveredCount > 1 ? 's' : ''}`);
        refetch();
      } else if (failedCount > 0) {
        setSyncMessage(`Failed to recover ${failedCount} ${syncProviderLabel} phone number${failedCount > 1 ? 's' : ''}. Check logs for details.`);
      } else if (totalInProvider === 0) {
        setSyncMessage(`No phone numbers found in ${syncProviderLabel}`);
      } else if (totalInProvider === totalInDatabase) {
        setSyncMessage(`All ${totalInDatabase} ${syncProviderLabel} phone number${totalInDatabase > 1 ? 's are' : ' is'} already synced`);
      } else {
        setSyncMessage(`Found ${totalInProvider} in ${syncProviderLabel}, ${totalInDatabase} in database. Sync may have issues.`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync phone numbers';
      console.error('Error syncing phone numbers:', err);
      setSyncMessage(errorMessage);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    setNumbers(prev => prev.map(n => {
      if (newStatus === 'active') {
        return {
          ...n,
          status: n.id === id ? 'active' : 'inactive',
          badge: n.id === id ? 'Active' : 'Inactive'
        };
      } else {
        return n.id === id ? { ...n, status: 'inactive', badge: 'Inactive' } : n;
      }
    }));

    try {
      const headers = await getAuthHeader();

      const response = await fetch(`${env.API_URL}/phone-numbers/${id}/status`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        console.error('Failed to update status on server');
        refetch();
      }
    } catch (e) {
      console.error('Failed to update status', e);
      refetch();
    }
  };

  return (
    <DashboardLayout fullWidth>
      <div className="flex h-full min-h-screen flex-col overflow-hidden bg-[#f7f8fb] text-slate-950">

        <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 md:px-6 xl:px-8">
          <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-700">
                <Smartphone className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div>
                <div className="mb-1 inline-flex items-center gap-2 rounded-md border border-cyan-100 bg-cyan-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-700">
                  Voice lines
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">Phone Numbers</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">The numbers your AI assistant answers and routes.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[520px]">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Connected</p>
                <p className="mt-1 text-base font-black text-slate-950">{activeCount}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SignalWire</p>
                <p className="mt-1 text-base font-black text-slate-950">{providerCounts.signalwire}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Telnyx</p>
                <p className="mt-1 text-base font-black text-slate-950">{providerCounts.telnyx}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
                <p className="mt-1 text-base font-black text-slate-950">{numbers.length}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-8 xl:px-8">
          <div className="mx-auto w-full max-w-[1500px]">

          {/* Sync Success Message */}
          {syncMessage && (
            <div className={`mb-4 flex items-center justify-between gap-4 rounded-lg border p-4 animate-in fade-in slide-in-from-top-4 ${syncMessage.includes('Successfully')
                ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                : syncMessage.includes('already synced')
                  ? 'border-slate-200 bg-white text-slate-600'
                  : 'border-rose-100 bg-rose-50 text-rose-700'
              }`}>
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-md ${syncMessage.includes('Successfully')
                    ? 'bg-emerald-100'
                    : syncMessage.includes('already synced')
                      ? 'bg-slate-100'
                      : 'bg-rose-100'
                  }`}>
                  {syncMessage.includes('Successfully') ? <ShieldCheck className="h-5 w-5" /> : syncMessage.includes('already synced') ? <Smartphone className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">
                    {syncMessage.includes('Successfully') ? 'Sync Successful' : syncMessage.includes('already synced') ? 'Already Synced' : 'Sync Failed'}
                  </p>
                  <p className="text-sm font-medium">{syncMessage}</p>
                </div>
              </div>
              <button
                onClick={() => setSyncMessage(null)}
                className="rounded-md p-2 transition-colors hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-rose-100 bg-rose-50 p-4 text-rose-700 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-rose-100">
                  <X className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Could not load numbers</p>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
              <button
                onClick={() => refetch()}
                className="rounded-md bg-rose-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-700"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

            {/* Table Header / Action Bar */}
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
                <div className="relative w-full md:max-w-md group">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-700" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-950 placeholder:text-slate-400 transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                    placeholder="Search numbers..."
                    type="text"
                  />
                </div>

                <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-100 p-1 md:w-auto">
                  {PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => setSyncProvider(provider.id)}
                      className={`rounded-md px-3 py-2 text-xs font-bold transition-colors ${
                        syncProvider === provider.id
                          ? 'bg-white text-cyan-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {provider.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  onClick={handleSyncFromProvider}
                  disabled={isSyncing}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} strokeWidth={2.5} />
                  {isSyncing ? 'Syncing...' : 'Sync Numbers'}
                </button>
                <button
                  onClick={() => navigate('/dashboard/voice-setup/buy')}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-xs font-bold text-white transition-colors hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                  Add Number
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="w-1/4 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Number</th>
                    <th className="w-1/5 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Nickname</th>
                    <th className="w-1/6 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Provider</th>
                    <th className="w-1/6 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="w-1/6 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Features</th>
                    <th className="w-1/6 px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-5"><div className="h-5 w-32 rounded bg-slate-100"></div></td>
                        <td className="px-6 py-5"><div className="h-5 w-24 rounded bg-slate-100"></div></td>
                        <td className="px-6 py-5"><div className="h-5 w-20 rounded bg-slate-100"></div></td>
                        <td className="px-6 py-5"><div className="h-5 w-16 rounded bg-slate-100"></div></td>
                        <td className="px-6 py-5"><div className="h-5 w-20 rounded bg-slate-100"></div></td>
                        <td className="px-6 py-5"><div className="ml-auto h-8 w-8 rounded bg-slate-100"></div></td>
                      </tr>
                    ))
                  ) : filteredNumbers.length > 0 ? (
                    filteredNumbers.map((num: PhoneNumber) => (
                      <tr
                        key={num.id}
                        onClick={() => navigate(`/dashboard/voice-setup/numbers/${num.id}`)}
                        className="group cursor-pointer transition-colors hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition-colors group-hover:border-cyan-100 group-hover:bg-cyan-50 group-hover:text-cyan-700">
                              <Phone className="h-5 w-5" />
                            </div>
                            <span className="text-base font-black tracking-tight text-slate-950 transition-colors group-hover:text-cyan-800">
                              {num.phone_number || num.phoneNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="max-w-[200px] truncate text-sm font-semibold text-slate-600">
                              {num.friendly_name || num.number || '-'}
                            </span>
                            <button
                              onClick={(e) => handleEditClick(num, e)}
                              className="rounded-md p-1.5 text-slate-400 opacity-0 transition-colors hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
                            >
                              <Settings2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600">
                            {num.provider === 'telnyx' ? 'Telnyx' : 'SignalWire'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => handleStatusChange(num.id, num.status || 'inactive', e)}
                              className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${num.status === 'active' ? 'bg-cyan-700' : 'bg-slate-200'}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${num.status === 'active' ? 'translate-x-4' : 'translate-x-0'}`}
                              />
                            </button>
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${num.status === 'active' ? 'text-cyan-700' : 'text-slate-400'}`}>
                              {num.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            {num.capabilities?.voice && (
                              <div className="flex items-center gap-1.5 rounded-md border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-cyan-700">
                                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Voice</span>
                              </div>
                            )}
                            {num.capabilities?.sms && (
                              <div className="flex items-center gap-1.5 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">SMS</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                            <button className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900">
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>
                        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                            <Smartphone className="h-7 w-7 text-slate-300" />
                          </div>
                          <h3 className="mb-2 text-lg font-black tracking-tight text-slate-950">
                            {numbers.length > 0 ? 'No matching numbers' : 'No numbers found'}
                          </h3>
                          <p className="mx-auto mb-6 max-w-sm text-sm font-medium text-slate-500">
                            {numbers.length > 0 ? 'Try a different search term or clear the search box.' : "You haven't added any phone numbers yet."}
                          </p>
                          <button
                            onClick={() => numbers.length > 0 ? setSearchQuery('') : navigate('/dashboard/voice-setup/buy')}
                            className="rounded-md bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800"
                          >
                            {numbers.length > 0 ? 'Clear Search' : 'Get Your First Number'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden">
              <div className="space-y-3 p-4">
                {loading ? (
                  [1, 2].map(i => (
                    <div key={i} className="h-40 animate-pulse rounded-lg border border-slate-200 bg-slate-50 p-6" />
                  ))
                ) : filteredNumbers.length > 0 ? (
                  filteredNumbers.map((num: PhoneNumber) => (
                    <div
                      key={num.id}
                      onClick={() => navigate(`/dashboard/voice-setup/numbers/${num.id}`)}
                      className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all active:scale-[0.99]"
                    >
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                            <Phone className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-black tracking-tight text-slate-950">{num.phone_number || num.phoneNumber}</h3>
                            <p className="truncate text-xs font-semibold text-slate-500">{num.friendly_name || 'No alias set'}</p>
                          </div>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleStatusChange(num.id, num.status || 'inactive', e)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${num.status === 'active' ? 'bg-cyan-700' : 'bg-slate-200'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${num.status === 'active' ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            {num.provider === 'telnyx' ? 'Telnyx' : 'SignalWire'}
                          </div>
                          {num.capabilities?.voice && (
                            <div className="rounded-md border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-700">Voice</div>
                          )}
                          {num.capabilities?.sms && (
                            <div className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">SMS</div>
                          )}
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                      <Smartphone className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-950">{numbers.length > 0 ? 'No matching numbers' : 'No numbers found'}</p>
                    <button
                      onClick={() => numbers.length > 0 ? setSearchQuery('') : navigate('/dashboard/voice-setup/buy')}
                      className="mt-4 rounded-md bg-slate-950 px-4 py-2 text-xs font-bold text-white"
                    >
                      {numbers.length > 0 ? 'Clear Search' : 'Get First Number'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Table Footer */}
            {numbers.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                <div>
                  Showing {filteredNumbers.length} of {numbers.length} {numbers.length === 1 ? 'number' : 'numbers'}
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Synced with provider
                </div>
              </div>
            )}
          </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {editingNumber && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div className="min-w-0">
                <h3 className="text-xl font-black tracking-tight text-slate-950">Rename Number</h3>
                <p className="mt-1 truncate text-xs font-bold uppercase tracking-wider text-slate-400">{editingNumber.phone_number}</p>
              </div>
              <button
                onClick={() => setEditingNumber(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="space-y-2">
                <label className="ml-1 text-xs font-bold text-slate-500">
                  Nickname
                </label>
                <div className="relative group/modal">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/modal:text-cyan-700">
                    <ArrowRight size={16} />
                  </div>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-950 placeholder:text-slate-400 transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                    placeholder="e.g. Front desk line"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border border-cyan-100 bg-cyan-50/70 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-cyan-700">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium leading-6 text-slate-600">
                  Nicknames help you tell numbers apart. Callers never see them.
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:justify-end">
              <button
                onClick={() => setEditingNumber(null)}
                className="h-10 rounded-md border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VoiceSetup;
