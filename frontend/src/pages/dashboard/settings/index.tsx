import { useState, useEffect, useRef } from 'react';
import {
  Save, Bell, AlertTriangle, CheckCircle, CalendarCheck, Link2
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { PageHeader } from '../../../components/ui/PageHeader';
import { SectionNav } from '../../../components/ui/SectionNav';
import { Button } from '../../../components/ui/Button';
import { PAGE_CONTAINER } from '../../../constants/layout';
import { api } from '../../../lib/api';
import { businessSetupAPI } from '../../../api/businessSetup';
import { BookingRequirementsContent } from './components/BookingRequirementsContent';
import { NotificationSettingsContent } from './components/NotificationSettingsContent';
import IntegrationsContent from './components/IntegrationsContent';
import type { NotificationSettings } from '../../../types/settings';

const Settings = () => {
  const unsavedChangesRef = useRef({
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

  const [savingAll, setSavingAll] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSection, setActiveSection] = useState<'booking' | 'notifications' | 'integrations'>('booking');

  useEffect(() => {
    const anyChanges = unsavedChangesRef.current.notifications ||
      unsavedChangesRef.current.bookingRequirements;
    setHasUnsavedChanges(anyChanges);
  }, [notifications]);

  useEffect(() => {
    const handleBookingChanges = (e: Event) => {
      const customEvent = e as CustomEvent;
      unsavedChangesRef.current.bookingRequirements = customEvent.detail?.hasChanges || false;
      setHasUnsavedChanges(
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

  const handleNotificationChange = (updates: Partial<NotificationSettings>) => {
    setNotifications(prev => ({ ...prev, ...updates }));
    unsavedChangesRef.current.notifications = true;
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    setSavingAll(true);

    try {
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
    { id: 'booking', label: 'Booking', icon: CalendarCheck, description: 'What to collect from callers' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts, emails, and transfers' },
    { id: 'integrations', label: 'Integrations', icon: Link2, description: 'Connected apps' },
  ] as const;

  const sectionHeaders = {
    booking: { title: 'Booking requirements', description: 'The details your agent collects before booking an appointment.' },
    notifications: { title: 'Notifications', description: 'Call alerts, appointment emails, and call transfer behaviour.' },
    integrations: { title: 'Integrations', description: 'Connected apps and calendar sync.' },
  } as const;

  return (
    <DashboardLayout>
      <div className={PAGE_CONTAINER}>
        <PageHeader
          title="Settings"
          description="Booking rules, notifications, and connected apps."
          actions={
            <Button onClick={handleSaveAll} disabled={savingAll || !hasUnsavedChanges}>
              <Save size={15} className={savingAll ? 'animate-pulse' : ''} />
              {savingAll ? 'Saving…' : 'Save changes'}
            </Button>
          }
        />

        {message && (
          <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${message.type === 'success'
            ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
            : 'border-rose-100 bg-rose-50 text-rose-800'
            }`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[240px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <SectionNav<typeof activeSection> items={sections} active={activeSection} onChange={setActiveSection} />

          <div className="min-w-0 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950">{sectionHeaders[activeSection].title}</h2>
                <p className="mt-0.5 text-sm text-slate-500">{sectionHeaders[activeSection].description}</p>
              </div>
              {activeSection === 'booking' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => window.dispatchEvent(new CustomEvent('booking-requirements-add-trigger'))}
                >
                  Add field
                </Button>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              {activeSection === 'booking' && <BookingRequirementsContent />}
              {activeSection === 'notifications' && (
                <NotificationSettingsContent settings={notifications} onChange={handleNotificationChange} />
              )}
              {activeSection === 'integrations' && <IntegrationsContent />}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
