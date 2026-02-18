import { useState } from 'react';
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

const VoiceSetup = () => {
  const navigate = useNavigate();
  const { numbers, loading, error, refetch, updateLocalNumber, setNumbers } = usePhoneNumbers();

  const [editingNumber, setEditingNumber] = useState<PhoneNumber | null>(null);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

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

  const handleSyncFromTwilio = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${env.API_URL}/phone-numbers/sync`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to sync phone numbers');
      }

      const data = await response.json();
      const summary = data.summary || {};
      const recoveredCount = summary.recovered_count || 0;
      const totalInTwilio = summary.total_in_twilio || 0;
      const totalInDatabase = summary.total_in_database || 0;
      const failedCount = summary.failed_count || 0;

      if (recoveredCount > 0) {
        setSyncMessage(`Successfully recovered ${recoveredCount} phone number${recoveredCount > 1 ? 's' : ''} from Twilio`);
        // Refresh the numbers list
        refetch();
      } else if (failedCount > 0) {
        setSyncMessage(`Failed to recover ${failedCount} phone number${failedCount > 1 ? 's' : ''}. Check logs for details.`);
      } else if (totalInTwilio === 0) {
        setSyncMessage('No phone numbers found in Twilio account');
      } else if (totalInTwilio === totalInDatabase) {
        setSyncMessage(`All ${totalInDatabase} phone number${totalInDatabase > 1 ? 's are' : ' is'} already synced`);
      } else {
        setSyncMessage(`Found ${totalInTwilio} in Twilio, ${totalInDatabase} in database. Sync may have issues.`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync phone numbers';
      console.error('Error syncing phone numbers:', err);
      setSyncMessage(errorMessage);
    } finally {
      setIsSyncing(false);
      // Clear message after 5 seconds
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
      <div className="flex-1 flex flex-col bg-background dark:bg-slate-950 min-h-screen scrollbar-premium">

        {/* Standard Page Header */}
        <header className="px-6 py-5 md:px-8 md:py-6 border-b border-border bg-card/50 flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-10 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
              <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Phone Numbers</h1>
              <p className="text-[10px] md:text-xs font-medium text-muted-foreground mt-0.5 md:mt-1">Manage your active communication lines.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleSyncFromTwilio}
              disabled={isSyncing}
              className="flex-1 md:flex-none px-4 md:px-5 py-2.5 bg-muted text-muted-foreground font-black uppercase tracking-widest text-[9px] md:text-[10px] rounded-xl border border-border hover:bg-muted/80 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} strokeWidth={2.5} />
              {isSyncing ? 'Syncing...' : 'Sync from Twilio'}
            </button>
            <button
              onClick={() => navigate('/dashboard/voice-setup/buy')}
              className="flex-1 md:flex-none px-4 md:px-5 py-2.5 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[9px] md:text-[10px] rounded-xl shadow-glow-blue hover:bg-primary/95 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={3} />
              Acquire New
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:px-8 md:py-12">

          {/* Sync Success Message */}
          {syncMessage && (
            <div className={`mb-10 border p-6 rounded-[2rem] flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 ${syncMessage.includes('Successfully')
                ? 'bg-success/5 border-success/20 text-success'
                : syncMessage.includes('already synced')
                  ? 'bg-muted/50 border-border text-muted-foreground'
                  : 'bg-destructive/5 border-destructive/20 text-destructive'
              }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${syncMessage.includes('Successfully')
                    ? 'bg-success/10'
                    : syncMessage.includes('already synced')
                      ? 'bg-muted'
                      : 'bg-destructive/10'
                  }`}>
                  {syncMessage.includes('Successfully') ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : syncMessage.includes('already synced') ? (
                    <Smartphone className="w-6 h-6" />
                  ) : (
                    <X className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">
                    {syncMessage.includes('Successfully') ? 'Sync Successful' : syncMessage.includes('already synced') ? 'Already Synced' : 'Sync Failed'}
                  </p>
                  <p className="text-sm font-medium opacity-80">{syncMessage}</p>
                </div>
              </div>
              <button
                onClick={() => setSyncMessage(null)}
                className="p-2 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-10 bg-destructive/5 border border-destructive/20 text-destructive p-6 rounded-[2rem] flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <X className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Initialization Conflict</p>
                  <p className="text-sm font-medium opacity-80">{error}</p>
                </div>
              </div>
              <button
                onClick={() => refetch()}
                className="px-6 py-2.5 bg-destructive text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow-lg shadow-destructive/20 hover:bg-destructive/90 transition-all"
              >
                Pulse Refresh
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-card border border-border rounded-[2.5rem] shadow-premium-lg overflow-hidden relative">

            {/* Table Header / Action Bar */}
            <div className="px-10 py-8 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-6 bg-muted/20">
              <div className="flex items-center gap-6 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full sm:w-80 h-14 pl-12 pr-6 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold"
                    placeholder="Search allocation nodes..."
                    type="text"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Network Operational</span>
                </div>
                <div className="h-6 w-px bg-border" />
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{numbers.length} Active Allocations</span>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-1/4">Number</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-1/4">Alias</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-1/6">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-1/6">Capabilities</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-8 py-6"><div className="h-6 w-32 bg-muted/50 rounded-lg"></div></td>
                        <td className="px-8 py-6"><div className="h-6 w-24 bg-muted/50 rounded-lg"></div></td>
                        <td className="px-8 py-6"><div className="h-6 w-16 bg-muted/50 rounded-lg"></div></td>
                        <td className="px-8 py-6"><div className="h-6 w-20 bg-muted/50 rounded-lg"></div></td>
                        <td className="px-8 py-6"><div className="h-8 w-8 bg-muted/50 rounded-lg ml-auto"></div></td>
                      </tr>
                    ))
                  ) : numbers.length > 0 ? (
                    numbers.map((num: PhoneNumber) => (
                      <tr
                        key={num.id}
                        onClick={() => navigate(`/dashboard/voice-setup/numbers/${num.id}`)}
                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <Phone className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                              {num.phone_number || num.phoneNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-600 truncate max-w-[200px]">
                              {num.friendly_name || num.number || '-'}
                            </span>
                            <button
                              onClick={(e) => handleEditClick(num, e)}
                              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Settings2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => handleStatusChange(num.id, num.status || 'inactive', e)}
                              className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${num.status === 'active' ? 'bg-primary' : 'bg-slate-200'}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${num.status === 'active' ? 'translate-x-4' : 'translate-x-0'}`}
                              />
                            </button>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${num.status === 'active' ? 'text-primary' : 'text-slate-400'}`}>
                              {num.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            {num.capabilities?.voice && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                <span className="text-[9px] font-bold uppercase tracking-wider">Voice</span>
                              </div>
                            )}
                            {num.capabilities?.sms && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                <span className="text-[9px] font-bold uppercase tracking-wider">SMS</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                            <Smartphone className="w-8 h-8 text-slate-300" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">No Numbers Found</h3>
                          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">You haven't added any phone numbers yet.</p>
                          <button
                            onClick={() => navigate('/dashboard/voice-setup/buy')}
                            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-primary/90 transition-all"
                          >
                            Get Your First Number
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
              <div className="p-4 space-y-4">
                {loading ? (
                  [1, 2].map(i => (
                    <div key={i} className="bg-background rounded-2xl p-6 border border-border animate-pulse h-40" />
                  ))
                ) : numbers.length > 0 ? (
                  numbers.map((num: PhoneNumber) => (
                    <div
                      key={num.id}
                      onClick={() => navigate(`/dashboard/voice-setup/numbers/${num.id}`)}
                      className="bg-background rounded-3xl p-6 border border-border shadow-sm active:scale-[0.98] transition-all relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                            <Phone className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">{num.phone_number || num.phoneNumber}</h3>
                            <p className="text-xs font-bold text-muted-foreground">{num.friendly_name || 'No alias set'}</p>
                          </div>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleStatusChange(num.id, num.status || 'inactive', e)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${num.status === 'active' ? 'bg-primary' : 'bg-slate-200'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${num.status === 'active' ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {num.capabilities?.voice && (
                            <div className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black uppercase tracking-wider">Voice</div>
                          )}
                          {num.capabilities?.sms && (
                            <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-wider">SMS</div>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                      <Smartphone className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">No Numbers Found</p>
                    <button onClick={() => navigate('/dashboard/voice-setup/buy')} className="mt-4 text-xs font-black text-primary uppercase tracking-widest">Get First Number</button>
                  </div>
                )}
              </div>
            </div>

            {/* Premium Table Footer */}
            {numbers.length > 0 && (
              <div className="px-10 py-6 border-t border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-4 font-black uppercase tracking-widest text-[9px] text-muted-foreground">
                  Showing {numbers.length} of {numbers.length} allocations
                </div>
                <div className="flex items-center gap-3 font-black uppercase tracking-widest text-[9px] text-muted-foreground opacity-30">
                  Global Edge Network Status: Operational
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Premium Edit Modal */}
      {editingNumber && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card rounded-[3rem] border border-border shadow-premium-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            <div className="absolute top-0 inset-x-0 h-2 bg-primary shadow-glow-blue" />

            <div className="flex items-center justify-between p-10 pb-6">
              <div>
                <h3 className="text-2xl font-black text-foreground tracking-tight mb-1">Allocation Protocol</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 italic">Updating metadata for node {editingNumber.phone_number}</p>
              </div>
              <button
                onClick={() => setEditingNumber(null)}
                className="p-3 bg-muted text-muted-foreground hover:text-foreground rounded-2xl hover:bg-muted/80 transition-all border border-border"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-10 py-6 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  Friendly Identity <span className="text-primary italic">(Alias)</span>
                </label>
                <div className="relative group/modal">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/modal:text-primary transition-colors">
                    <ArrowRight size={18} />
                  </div>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-18 pl-14 pr-6 rounded-[1.5rem] border border-border bg-muted/30 text-foreground placeholder-muted-foreground/30 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold"
                    placeholder="e.g. Primary Executive Line"
                    autoFocus
                  />
                </div>
              </div>

              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-medium text-primary leading-relaxed">
                  Friendly names are internal-only metadata. They do not affect routing logic or carrier display.
                </div>
              </div>
            </div>

            <div className="p-10 bg-muted/20 border-t border-border flex items-center justify-end gap-4">
              <button
                onClick={() => setEditingNumber(null)}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground bg-background border border-border hover:bg-muted rounded-2xl transition-all"
              >
                Abort Changes
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/95 rounded-2xl shadow-glow-blue transition-all disabled:opacity-50 flex items-center gap-3 hover:-translate-y-0.5 active:scale-95"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Commit Metadata
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VoiceSetup;
