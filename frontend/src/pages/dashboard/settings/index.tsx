import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save, Volume2, Bell, AlertTriangle, CheckCircle, ChevronRight, Zap, Link2
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { api } from '../../../lib/api';
import { businessSetupAPI } from '../../../api/businessSetup';
import { BookingRequirementsContent } from './components/BookingRequirementsContent';
import { VoiceSettingsContent } from './components/VoiceSettingsContent';
import { NotificationSettingsContent } from './components/NotificationSettingsContent';
import IntegrationsContent from './components/IntegrationsContent';
import type { NotificationSettings, Voice, VoiceSettings } from '../../../types/settings';

const clampSpeakingSpeed = (speed?: number) => Math.max(0.7, Math.min(1.5, speed || 1.0));

const Settings = () => {
  const navigate = useNavigate();
  const unsavedChangesRef = useRef({
    voiceSettings: false,
    notifications: false,
    bookingRequirements: false
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    urgent_call_alerts: true,
    booking_confirmations: true,
    missed_call_alerts: true,
    urgent_transfer_enabled: false,
    transfer_number: '',
    standard_transfer_enabled: false,
    standard_transfer_number: ''
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice_id: '',
    model_name: '',
    speaking_speed: 1.0,
    conversation_tone: 'friendly',
    custom_greeting: '',
    after_hours_greeting: '',
    language: 'en-US',
    is_active: true,
    sync_google_calendar: true
  });

  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [savingAll, setSavingAll] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSection, setActiveSection] = useState('voice');
  const [userPlan, setUserPlan] = useState<string>('');

  useEffect(() => {
    const anyChanges = unsavedChangesRef.current.voiceSettings ||
      unsavedChangesRef.current.notifications ||
      unsavedChangesRef.current.bookingRequirements;
    setHasUnsavedChanges(anyChanges);
  }, [voiceSettings, notifications]);

  useEffect(() => {
    const handleBookingChanges = (e: Event) => {
      const customEvent = e as CustomEvent;
      unsavedChangesRef.current.bookingRequirements = customEvent.detail?.hasChanges || false;
      setHasUnsavedChanges(
        unsavedChangesRef.current.voiceSettings ||
        unsavedChangesRef.current.notifications ||
        unsavedChangesRef.current.bookingRequirements
      );
    };

    window.addEventListener('booking-requirements-changes', handleBookingChanges);
    return () => {
      window.removeEventListener('booking-requirements-changes', handleBookingChanges);
    };
  }, []);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const voicesResp = await api.getVoices().catch(e => console.warn("Voices load failed", e));
      if (voicesResp?.data) setAvailableVoices(voicesResp.data);

      const voiceSettingsResp = await api.getVoiceSettings().catch(e => console.warn("Voice settings load failed", e));
      if (voiceSettingsResp) {
        setVoiceSettings({
          id: voiceSettingsResp.id,
          voice_id: voiceSettingsResp.voice_id || '',
          model_name: voiceSettingsResp.model_name || '',
          speaking_speed: clampSpeakingSpeed(voiceSettingsResp.speaking_speed),
          conversation_tone: voiceSettingsResp.conversation_tone || 'friendly',
          custom_greeting: voiceSettingsResp.custom_greeting || '',
          after_hours_greeting: voiceSettingsResp.after_hours_greeting || '',
          language: voiceSettingsResp.language || 'en-US',
          is_active: voiceSettingsResp.is_active !== undefined ? voiceSettingsResp.is_active : true,
          sync_google_calendar: voiceSettingsResp.sync_google_calendar !== undefined ? voiceSettingsResp.sync_google_calendar : true
        });
      }

      // Load Billing Plan
      const billingResp = await api.getBilling().catch(e => console.warn("Billing load failed", e));
      if (billingResp?.plan) {
        setUserPlan(billingResp.plan);
      }

      // Load notification settings from business setup API
      const businessSetup = await api.getBusinessSetup().catch(e => console.warn("Business setup load failed", e));
      if (businessSetup?.notification_settings || businessSetup?.urgent_call_rules) {

        // Extract transfer settings from urgent_call_rules
        let urgentTransferEnabled = false;
        let urgentTransferNumber = '';
        let standardTransferEnabled = false;
        let standardTransferNumber = '';

        let bookingEmailEnabled = true; // default ON

        if (businessSetup.urgent_call_rules) {
          const urgentRule = businessSetup.urgent_call_rules.find((r: { rule_type: string; is_enabled?: boolean; transfer_number?: string }) => r.rule_type === 'urgent');
          if (urgentRule) {
            urgentTransferEnabled = urgentRule.is_enabled ?? false;
            urgentTransferNumber = urgentRule.transfer_number || '';
          }

          const standardRule = businessSetup.urgent_call_rules.find((r: { rule_type: string; is_enabled?: boolean; transfer_number?: string }) => r.rule_type === 'standard');
          if (standardRule) {
            standardTransferEnabled = standardRule.is_enabled ?? false;
            standardTransferNumber = standardRule.transfer_number || '';
          }
          const bookingEmailRule = businessSetup.urgent_call_rules.find((r: { rule_type: string; is_enabled?: boolean }) => r.rule_type === 'booking_email');
          if (bookingEmailRule) {
            bookingEmailEnabled = bookingEmailRule.is_enabled ?? true;
          }
        }

        setNotifications({
          urgent_call_alerts: businessSetup.notification_settings?.urgent_call_alerts ?? true,
          booking_confirmations: bookingEmailEnabled,
          missed_call_alerts: businessSetup.notification_settings?.missed_call_alerts ?? true,
          urgent_transfer_enabled: urgentTransferEnabled,
          transfer_number: urgentTransferNumber,
          standard_transfer_enabled: standardTransferEnabled,
          standard_transfer_number: standardTransferNumber
        });
      } else {
        // Fallback to localStorage for legacy data, then remove it
        const savedNotifications = localStorage.getItem('notification_settings');
        if (savedNotifications) {
          const parsed = JSON.parse(savedNotifications);
          setNotifications(prev => ({ ...prev, ...parsed }));
        }
      }

    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings. Please try again.' });
    }
  };

  const handleVoiceChange = (updates: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({ ...prev, ...updates }));
    unsavedChangesRef.current.voiceSettings = true;
    setHasUnsavedChanges(true);
  };

  const handleNotificationChange = (updates: Partial<NotificationSettings>) => {
    setNotifications(prev => ({ ...prev, ...updates }));
    unsavedChangesRef.current.notifications = true;
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    setSavingAll(true);

    try {
      if (unsavedChangesRef.current.voiceSettings) {
        const voiceUpdates = {
          voice_id: voiceSettings.voice_id,
          model_name: voiceSettings.model_name,
          speaking_speed: voiceSettings.speaking_speed,
          conversation_tone: voiceSettings.conversation_tone,
          custom_greeting: voiceSettings.custom_greeting,
          after_hours_greeting: voiceSettings.after_hours_greeting,
          language: voiceSettings.language,
          is_active: voiceSettings.is_active
        };
        await api.updateVoiceSettings(voiceUpdates);
      }

      if (unsavedChangesRef.current.notifications) {
        // Save non-transfer notification settings
        const notificationData = {
          urgent_call_alerts: notifications.urgent_call_alerts,
          booking_confirmations: notifications.booking_confirmations,
          missed_call_alerts: notifications.missed_call_alerts
        };
        await api.updateNotificationSettings(notificationData as unknown as Record<string, unknown>);

        // Save transfer rules + booking email toggle to urgent_call_rules table
        const transferRules = [];

        // Booking email toggle (always include so it persists)
        transferRules.push({
          condition_text: 'Send email on new booking',
          action: 'notify',
          transfer_number: '',
          is_enabled: notifications.booking_confirmations ?? true,
          rule_type: 'booking_email' as const
        });

        if (notifications.transfer_number) {
          transferRules.push({
            condition_text: 'Emergency or urgent request',
            action: 'transfer',
            transfer_number: notifications.transfer_number,
            is_enabled: notifications.urgent_transfer_enabled ?? false,
            rule_type: 'urgent' as const
          });
        }
        if (notifications.standard_transfer_number) {
          transferRules.push({
            condition_text: 'Customer requests transfer',
            action: 'transfer',
            transfer_number: notifications.standard_transfer_number,
            is_enabled: notifications.standard_transfer_enabled ?? false,
            rule_type: 'standard' as const
          });
        }
        await businessSetupAPI.updateUrgentCallRules(transferRules);
        // Clean up legacy localStorage
        localStorage.removeItem('notification_settings');
      }

      if (unsavedChangesRef.current.bookingRequirements) {
        const promises: Promise<unknown>[] = [];
        window.dispatchEvent(new CustomEvent('booking-requirements-save', {
          detail: { registerPromise: (p: Promise<unknown>) => promises.push(p) }
        }));
        if (promises.length > 0) {
          await Promise.all(promises);
        }
      }

      unsavedChangesRef.current = {
        voiceSettings: false,
        notifications: false,
        bookingRequirements: false
      };
      setHasUnsavedChanges(false);

      setMessage({ type: 'success', text: 'All settings saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving all settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSavingAll(false);
    }
  };

  const sections = [
    { id: 'voice', label: 'AI Voice', icon: Volume2, description: 'Sound & Persona' },
    { id: 'booking', label: 'Booking', icon: Zap, description: 'Rules & Requirements' },
    { id: 'notifications', label: 'Alerts', icon: Bell, description: 'System Notifications' },
    { id: 'integrations', label: 'Integrations', icon: Link2, description: 'Connected Apps' },
  ];

  return (
    <DashboardLayout fullWidth>
      <div className="flex h-full flex-col overflow-hidden bg-[#f7f8fb] text-slate-950">

        <div className="lg:hidden flex-none border-b border-slate-200 bg-white px-4 py-4">
          <div className="flex items-center justify-between gap-4">
          <div>
              <h1 className="text-lg font-black tracking-tight text-slate-950">Settings</h1>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">Voice, booking, alerts, and integrations</p>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={savingAll || !hasUnsavedChanges}
              className={`flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-black uppercase tracking-wider transition ${savingAll || !hasUnsavedChanges
              ? 'cursor-not-allowed bg-slate-100 text-slate-400'
              : 'bg-cyan-600 text-white shadow-sm shadow-cyan-200 hover:bg-cyan-700'
              }`}
          >
            {savingAll ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {savingAll ? 'Saving...' : 'Save'}
          </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

          <div className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:w-72 lg:border-b-0 lg:border-r">
            <div className="hidden border-b border-slate-100 p-6 lg:block">
              <h1 className="text-2xl font-black tracking-tight text-slate-950">Settings</h1>
              <p className="mt-1 text-xs font-semibold text-slate-500">Control center</p>
            </div>

            <div className="custom-scrollbar flex gap-1.5 overflow-x-auto px-4 py-3 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:p-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`group flex shrink-0 items-center gap-3 rounded-lg border p-3 text-left transition lg:w-full ${activeSection === section.id
                    ? 'border-cyan-200 bg-cyan-50 text-cyan-950'
                    : 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${activeSection === section.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 text-slate-400 group-hover:text-cyan-600'
                    }`}>
                    <section.icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-black tracking-tight ${activeSection === section.id ? 'text-slate-950' : 'text-slate-700'
                      }`}>{section.label}</p>
                    <p className={`hidden truncate text-xs font-semibold lg:block ${activeSection === section.id ? 'text-cyan-700' : 'text-slate-400'}`}>{section.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-auto hidden border-t border-slate-100 p-5 lg:block">
              <button
                onClick={handleSaveAll}
                disabled={savingAll || !hasUnsavedChanges}
                className={`flex h-11 w-full items-center justify-center gap-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition ${savingAll || !hasUnsavedChanges
                    ? 'cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-300'
                    : 'bg-cyan-600 text-white shadow-sm shadow-cyan-200 hover:bg-cyan-700'
                  }
              `}
              >
                {savingAll ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {savingAll ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* --- Main Content Area --- */}
          <div className="custom-scrollbar flex-1 overflow-y-auto p-4 md:p-6 2xl:p-8">
            <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {message && (
                <div className={`flex items-center gap-3 rounded-lg border p-4 shadow-sm animate-in fade-in slide-in-from-top-2 ${message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                  : 'bg-rose-50 text-rose-800 border-rose-100'
                  }`}>
                  <div className={`p-1.5 rounded-full ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {message.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                  </div>
                  <span className="font-bold text-[10px] uppercase tracking-wider">{message.text}</span>
                </div>
              )}

              <div className="space-y-6">
                {activeSection === 'voice' && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-950">AI Voice Setup</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">Select the voice, language, pacing, and opening messages.</p>
                      </div>
                      <button
                        onClick={() => navigate('/dashboard/voice-model/method')}
                        className="hidden h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black uppercase tracking-wider text-slate-500 shadow-sm transition hover:border-cyan-500 hover:text-cyan-700 sm:flex"
                      >
                        Advanced <ChevronRight size={12} />
                      </button>
                    </div>

                    <VoiceSettingsContent
                      settings={voiceSettings}
                      availableVoices={availableVoices}
                      onChange={handleVoiceChange}
                      onNavigateToAdvanced={() => navigate('/dashboard/voice-model/method')}
                      plan={userPlan}
                    />
                  </div>
                )}

                {activeSection === 'booking' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-950">Booking Requirements</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">Appointment intake fields and validation rules.</p>
                      </div>
                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('booking-requirements-add-trigger'));
                        }}
                        className="hidden h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black uppercase tracking-wider text-slate-500 shadow-sm transition hover:border-cyan-500 hover:text-cyan-700 sm:flex"
                      >
                        Add Field
                      </button>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 lg:p-6">
                      <BookingRequirementsContent />
                    </div>
                  </div>
                )}

                {activeSection === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-950">Notification Alerts</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">Call alerts, booking emails, and transfer behavior.</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 lg:p-6">
                      <NotificationSettingsContent
                        settings={notifications}
                        onChange={handleNotificationChange}
                      />
                    </div>
                  </div>
                )}

                {activeSection === 'integrations' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-950">Integrations</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">Connected apps and calendar sync.</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 lg:p-6">
                      <IntegrationsContent />
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Bottom Space */}
              <div className="lg:hidden h-20" />
            </div>
          </div>
        </div>

        <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0; /* Slate-200 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1; /* Slate-300 */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
