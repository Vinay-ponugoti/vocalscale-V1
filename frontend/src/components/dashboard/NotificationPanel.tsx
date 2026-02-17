import React, { useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  CheckCheck,
  Calendar,
  AlertTriangle,
  Bell,
  BellOff,
  Clock,
  ChevronRight
} from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import type { NotificationCall } from '../../hooks/useNotifications';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationCall[];
  onDismiss: (id: string) => void;
  onDismissAll?: () => void;
  onSelect?: (id: string) => void;
  isLoading?: boolean;
}

// Helper function to format date groups
const formatDateGroup = (dateString: string): string => {
  const date = parseISO(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
};

// Group notifications by date
const groupByDate = (notifications: NotificationCall[]) => {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  return safeNotifications.reduce((groups, notif) => {
    const dateKey = format(parseISO(notif.created_at), 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notif);
    return groups;
  }, {} as Record<string, NotificationCall[]>);
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onDismiss,
  onDismissAll,
  onSelect,
  isLoading = false
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSelect = useCallback((id: string) => {
    onSelect?.(id);
    onClose();
  }, [onSelect, onClose]);

  if (!isOpen) return null;

  const groupedNotifications = groupByDate(notifications);
  const dateGroups = Object.keys(groupedNotifications).sort().reverse();

  return (
    <>
      {/* Backdrop - Full screen on mobile, subtle on desktop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose} 
      />

      {/* Panel Container - Centered on mobile, absolute on desktop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:block md:p-0 pointer-events-none">
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          className="
            pointer-events-auto
            w-full max-w-md md:w-[420px] 
            bg-white 
            rounded-2xl 
            shadow-2xl 
            border border-slate-200
            overflow-hidden 
            flex flex-col 
            max-h-[85vh] md:max-h-[70vh]
            animate-in fade-in zoom-in-95 slide-in-from-bottom-4 md:slide-in-from-top-2 duration-200
          "
        >
          {/* ═══════════════════════════════════════════════════════════
              HEADER
          ═══════════════════════════════════════════════════════════ */}
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center justify-between">
              {/* Title */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <Bell className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">
                    Notifications
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {notifications.length === 0
                      ? 'No new notifications'
                      : `${notifications.length} unread notification${notifications.length !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {notifications.length > 0 && onDismissAll && (
                  <button
                    onClick={onDismissAll}
                    className="
                      flex items-center gap-1.5 
                      text-xs font-semibold 
                      text-slate-600 hover:text-indigo-600 
                      px-3 py-2 
                      rounded-lg 
                      hover:bg-indigo-50 
                      transition-colors
                    "
                    title="Mark all as read"
                  >
                    <CheckCheck size={16} />
                    <span className="hidden sm:inline">Clear all</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="
                    p-2 
                    text-slate-400 hover:text-slate-700 
                    hover:bg-slate-200/50 
                    rounded-xl 
                    transition-colors
                  "
                  aria-label="Close notifications"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              CONTENT
          ═══════════════════════════════════════════════════════════ */}
          <div className="overflow-y-auto flex-1 overscroll-contain bg-slate-50/30">

            {/* Loading State */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500 mt-4 font-medium">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="p-6 bg-slate-100 rounded-full mb-4 shadow-inner">
                  <BellOff className="text-slate-400" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  All caught up!
                </h3>
                <p className="text-sm text-slate-500 mt-2 max-w-[240px] leading-relaxed">
                  You have no new notifications at the moment. Check back later.
                </p>
              </div>
            ) : (
              /* Notification List */
              <div className="p-3 space-y-6">
                {dateGroups.map((dateKey) => (
                  <div key={dateKey} className="space-y-3">
                    {/* Date Group Header */}
                    <div className="flex items-center gap-3 px-2 sticky top-0 bg-white/95 py-1 z-10 backdrop-blur-sm">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {formatDateGroup(groupedNotifications[dateKey][0].created_at)}
                      </span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    {/* Notifications in Group */}
                    <div className="space-y-2">
                      {groupedNotifications[dateKey].map((notif) => (
                        <NotificationCard
                          key={notif.id}
                          notification={notif}
                          onSelect={handleSelect}
                          onDismiss={onDismiss}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════
              FOOTER
          ═══════════════════════════════════════════════════════════ */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex-shrink-0">
              <button 
                onClick={onClose}
                className="
                  w-full 
                  text-center 
                  text-sm font-semibold 
                  text-indigo-600 hover:text-indigo-700 
                  py-2 
                  rounded-lg 
                  hover:bg-indigo-50 
                  transition-colors
                "
              >
                Close Panel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   NOTIFICATION CARD COMPONENT
═══════════════════════════════════════════════════════════════════════ */

interface NotificationCardProps {
  notification: NotificationCall;
  onSelect: (id: string) => void;
  onDismiss: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = React.memo(({
  notification,
  onSelect,
  onDismiss
}) => {
  const isBooking = notification.category === 'Booking';
  
  // Determine styles based on category
  const styles = isBooking 
    ? {
        iconBg: 'bg-indigo-50 text-indigo-600',
        badgeBg: 'bg-indigo-100 text-indigo-700',
        borderHover: 'hover:border-indigo-200',
        ringHover: 'group-hover:ring-indigo-100'
      }
    : {
        iconBg: 'bg-amber-50 text-amber-600',
        badgeBg: 'bg-amber-100 text-amber-700',
        borderHover: 'hover:border-amber-200',
        ringHover: 'group-hover:ring-amber-100'
      };

  return (
    <div
      onClick={() => onSelect(notification.id)}
      className={`
        group 
        relative 
        bg-white 
        border border-slate-200 
        rounded-xl 
        p-4 
        shadow-sm
        ${styles.borderHover}
        hover:shadow-md
        hover:ring-4 ${styles.ringHover}
        transition-all 
        duration-200 
        cursor-pointer
        active:scale-[0.99]
      `}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={`
          shrink-0 
          w-10 h-10 
          rounded-xl 
          flex items-center justify-center
          transition-transform duration-200 group-hover:scale-110
          ${styles.iconBg}
        `}>
          {isBooking ? <Calendar size={20} /> : <AlertTriangle size={20} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-bold text-slate-900 text-sm">
                  {isBooking ? 'New Booking' : 'Action Required'}
                </h4>
                <span className={`
                  text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md tracking-wide
                  ${styles.badgeBg}
                `}>
                  {notification.category}
                </span>
              </div>
              <p className="text-sm text-slate-700 font-medium truncate">
                {notification.caller_name}
              </p>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-slate-400 shrink-0 mt-0.5">
              <Clock size={12} />
              <span className="text-[11px] font-semibold tabular-nums">
                {format(parseISO(notification.created_at), 'h:mm a')}
              </span>
            </div>
          </div>

          {/* Phone */}
          {notification.caller_phone && (
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {notification.caller_phone}
            </p>
          )}

          {/* Notes */}
          {(notification.notes || notification.summary) && (
            <div className="
              mt-3 
              p-3 
              bg-slate-50 
              rounded-lg 
              border border-slate-100
            ">
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {notification.notes || notification.summary}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-3">
             {/* View Details Link - Always visible on touch, hover on desktop */}
            <div className={`
              flex items-center gap-1 
              text-xs font-bold 
              text-indigo-600 
              transition-all duration-200
              /* Mobile: Always visible */
              /* Desktop: Hidden by default, show on hover */
              opacity-100 translate-y-0
              md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0
            `}>
              <span>View details</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
          className={`
            absolute 
            top-2 right-2 
            p-2
            rounded-lg 
            bg-white border border-slate-200 shadow-sm
            text-slate-400 
            hover:text-emerald-600 
            hover:border-emerald-200 
            hover:bg-emerald-50 
            transition-all duration-200
            /* Mobile: Always visible */
            /* Desktop: Hidden by default, show on hover */
            opacity-100
            md:opacity-0 md:group-hover:opacity-100
          `}
          aria-label="Mark as handled"
          title="Mark as handled"
        >
          <Check size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
});

NotificationCard.displayName = 'NotificationCard';

export default NotificationPanel;