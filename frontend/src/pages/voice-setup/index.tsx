import { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import {
  Plus,
  Smartphone,
  PlusCircle,
  Search,
  Link as LinkIcon,
  Phone,
  Settings2,
  X,
  Loader2,
  ChevronRight,
  ArrowRight,
  ShieldCheck
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
        <header className="px-8 py-6 border-b border-border bg-card/50 flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-10 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
              <Smartphone className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Phone Numbers</h1>
              <p className="text-xs font-medium text-muted-foreground mt-1">Manage your active communication lines.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/voice-setup/existing')}
              className="px-5 py-2.5 bg-background hover:bg-muted text-muted-foreground font-black uppercase tracking-widest text-[10px] rounded-xl border border-border transition-all hover:border-foreground/20"
            >
              Link Existing
            </button>
            <button
              onClick={() => navigate('/dashboard/voice-setup/buy')}
              className="px-5 py-2.5 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] rounded-xl shadow-glow-blue hover:bg-primary/95 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={3} />
              Acquire New
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-12">

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

            {/* List Area */}
            <div className="p-2 sm:p-4">
              {loading ? (
                <div className="space-y-4 p-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 rounded-[2rem] border border-border bg-muted/20 animate-pulse" />
                  ))}
                </div>
              ) : numbers.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {numbers.map((num: PhoneNumber) => (
                    <div
                      key={num.id}
                      onClick={() => navigate(`/dashboard/voice-setup/numbers/${num.id}`)}
                      className="group flex flex-col sm:flex-row sm:items-center gap-6 p-8 rounded-[2rem] border border-border bg-card hover:border-primary/30 hover:shadow-premium-sm transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full -mr-16 -mt-16 blur-2xl" />

                      {/* Left: Info Card */}
                      <div className="flex items-center gap-6 flex-1 min-w-0 relative z-10">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-muted border border-border flex items-center justify-center shrink-0 group-hover:bg-primary/[0.03] group-hover:border-primary/20 transition-all duration-500">
                          <Phone className={`w-6 h-6 ${num.status === 'active' ? 'text-primary' : 'text-muted-foreground/30'}`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xl font-black text-foreground tracking-tight mb-1 group-hover:text-primary transition-colors">
                            {num.phone_number || num.phoneNumber}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Alias:</span>
                            <span className="text-[10px] font-bold text-foreground truncate lowercase opacity-80">{num.friendly_name || num.number}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Capabilities */}
                      <div className="flex items-center gap-3 bg-muted/30 px-5 py-3 rounded-2xl border border-border/50 relative z-10">
                        {num.capabilities?.voice && (
                          <div className="flex items-center gap-2 pr-3 border-r border-border/50 last:border-0 last:pr-0">
                            <Settings2 size={12} className="text-primary/60" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground/70">Voice</span>
                          </div>
                        )}
                        {num.capabilities?.sms && (
                          <div className="flex items-center gap-2 last:border-0 last:pr-0">
                            <LinkIcon size={12} className="text-indigo-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground/70">Secure SMS</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-10 relative z-10 border-t sm:border-t-0 pt-6 sm:pt-0 border-border/50">
                        <div
                          className="flex items-center gap-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-right hidden sm:block">
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-1">Operational State</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${num.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`}>
                              {num.status === 'active' ? 'Routing Active' : 'Suspended'}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleStatusChange(num.id, num.status || 'inactive', e)}
                            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-4 border-transparent transition-all duration-500 shadow-inner ${num.status === 'active' ? 'bg-primary' : 'bg-muted'
                              }`}
                            role="switch"
                          >
                            <span
                              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xl ring-0 transition-all duration-500 ${num.status === 'active' ? 'translate-x-6' : 'translate-x-0'
                                }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleEditClick(num, e)}
                            className="p-3 bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all border border-border hover:border-primary/20"
                          >
                            <Settings2 className="w-5 h-5" />
                          </button>
                          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="w-5 h-5 text-primary" strokeWidth={3} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty Identity State */
                <div className="flex flex-col items-center justify-center py-32 px-10 text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-full bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
                  <div className="w-24 h-24 bg-muted rounded-[2rem] border border-border flex items-center justify-center mb-10 shadow-premium-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Phone className="w-10 h-10 text-muted-foreground/30" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-black text-foreground tracking-tighter mb-4">Zero Nodes Assigned.</h3>
                  <p className="text-muted-foreground max-w-sm mb-12 text-base font-medium leading-relaxed italic opacity-80">
                    Your allocation pool is currently empty. Initialize a new communication endpoint to power your AI.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard/voice-setup/buy')}
                    className="inline-flex items-center gap-4 bg-primary hover:bg-primary/95 text-primary-foreground px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-glow-blue transition-all hover:-translate-y-1 active:scale-95"
                  >
                    <Plus className="w-5 h-5" strokeWidth={3} />
                    Acquire Initial Node
                  </button>
                </div>
              )}
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
