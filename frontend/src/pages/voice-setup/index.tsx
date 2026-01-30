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
  ChevronRight
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
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Phone Numbers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your phone numbers and provision new lines for your AI receptionist.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3">
            <Plus className="w-5 h-5 shrink-0 rotate-45" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Error loading phone numbers</p>
              <p className="text-xs opacity-80">{error}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="text-xs font-semibold bg-card border border-destructive/20 px-4 py-2 rounded-lg hover:bg-destructive/5 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-card border border-border rounded-2xl shadow-premium-sm overflow-hidden">
          
          {/* Action Bar */}
          <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all text-sm"
                placeholder="Search numbers..."
                type="text"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard/voice-setup/existing')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border bg-background rounded-xl font-medium text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Add Existing</span>
                <span className="sm:hidden">Add</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/voice-setup/buy')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm shadow-glow-blue hover:bg-primary/90 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Get New Number</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-6">
            
            {/* Loading State */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30 animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-16 bg-muted rounded-full" />
                  </div>
                ))}
              </div>
            ) : numbers.length > 0 ? (
              <div className="space-y-3">
                {numbers.map((num: PhoneNumber) => (
                  <div
                    key={num.id}
                    onClick={() => navigate(`/dashboard/voice-setup/numbers/${num.id}`)}
                    className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-premium transition-all cursor-pointer"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {num.phone_number || num.phoneNumber || '(415) 555-0123'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {num.friendly_name || num.number || 'Main Business Line'}
                      </p>
                    </div>
                    
                    {/* Status Toggle */}
                    <div 
                      className="flex items-center gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleStatusChange(num.id, num.status || 'inactive', e)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          num.status === 'active' ? 'bg-primary' : 'bg-muted'
                        }`}
                        role="switch"
                        aria-checked={num.status === 'active'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ${
                            num.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={`text-xs font-semibold min-w-[50px] ${
                        num.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {num.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {/* Capabilities */}
                    <div className="hidden sm:flex items-center gap-2">
                      {num.capabilities?.voice && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-[10px] font-semibold uppercase tracking-wider">
                          Voice
                        </span>
                      )}
                      {num.capabilities?.sms && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-[10px] font-semibold uppercase tracking-wider">
                          SMS
                        </span>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleEditClick(num, e)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <Smartphone className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Phone Numbers</h3>
                <p className="text-muted-foreground max-w-sm mb-8 text-sm">
                  You haven't connected any phone numbers yet. Get started by provisioning a new line.
                </p>
                <button
                  onClick={() => navigate('/dashboard/voice-setup/buy')}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-glow-blue transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Get New Number</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {numbers.length > 0 && (
            <div className="flex items-center justify-between border-t border-border px-4 sm:px-6 py-4 bg-muted/30">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{numbers.length}</span> number{numbers.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button disabled className="px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-muted-foreground cursor-not-allowed">
                  Previous
                </button>
                <button disabled className="px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-muted-foreground cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground text-lg">Edit Number Details</h3>
              <button
                onClick={() => setEditingNumber(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Phone Number
                </label>
                <div className="p-3.5 bg-muted rounded-xl text-foreground font-mono text-sm">
                  {editingNumber.phone_number}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Friendly Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all text-sm font-medium"
                  placeholder="e.g. Main Office Line"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-5 bg-muted/50 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setEditingNumber(null)}
                className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-background border border-border hover:bg-muted rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-2.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl shadow-glow-blue transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VoiceSetup;
