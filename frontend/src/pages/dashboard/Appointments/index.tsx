import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppointments, type Appointment } from '../../../hooks/useAppointments';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useSearch } from '../../../hooks/useSearch';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import AppointmentSchedule from '../../../components/dashboard/AppointmentSchedule';
import {
  format, addDays, startOfWeek, isSameDay,
  getHours, getMinutes, setHours, setMinutes, addMinutes
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, Plus, Clock, Moon, Sun,
  X, Layers, FileText, GripVertical, MapPin, Phone, Trash2, Pencil
} from 'lucide-react';

import {
  toZonedTime
} from 'date-fns-tz';


// --- DESIGN SYSTEM COLORS (Consistent with DashboardLayout) ---
const DS = {
  white: 'hsl(var(--ds-white))',
  surface: 'hsl(var(--ds-off-white))',
  offWhite: 'hsl(var(--ds-off-white))',
  border: 'rgb(var(--twc-slate-300))',
  ink: 'rgb(var(--twc-slate-800))',
  charcoal: 'rgb(var(--twc-slate-700))',
  stone: 'rgb(var(--twc-slate-600))',
  subtleText: 'rgb(var(--twc-slate-400))',
  electric: 'hsl(var(--chart-1))',
  electricDark: 'hsl(var(--chart-1))',
  electricLight: 'rgb(var(--twc-blue-50))',
  electricTint: 'hsl(var(--ds-electric-tint))',
  danger: 'rgb(var(--twc-red-500))',
  dangerBg: 'rgb(var(--twc-red-50))'
};

// ============ CUSTOM HOOKS ============
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// ============ TYPES ============
interface DragState {
  isDragging: boolean;
  appointmentId: string | null;
  originalStart: Date | null;
  currentDropTarget: { day: Date; hour: number; minute: number } | null;
}

type TimeFormat = '12h' | '24h';

// ============ MAIN COMPONENT ============
const FullScreenAppointments: React.FC = () => {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const { state } = useBusinessSetup();
  const timezone = state.data.business.timezone || 'America/New_York';
  const { appointments, loading, isPlaceholderData, error, updateAppointment, createAppointment, deleteAppointment } = useAppointments();
  const { searchQuery } = useSearch();

  const isInitialLoading = loading && !isPlaceholderData;

  // View State
  const [currentDate, setCurrentDate] = useState(toZonedTime(new Date(), timezone));
  const [show24Hours, setShow24Hours] = useState(false);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12h');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'day'>(isMobile ? 'day' : 'week');

  useEffect(() => {
    if (isMobile) {
       
      setViewMode('day');
    }
  }, [isMobile]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Appointment>>({});
  const [showWeekend, setShowWeekend] = useState(true);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Notes side pane — separate from editForm so notes save without entering edit mode
  const [noteDraft, setNoteDraft] = useState('');
  const [noteStatus, setNoteStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  // Dialog drag offset — reset each time a new appointment opens
  const [dialogPos, setDialogPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    setNoteDraft(appointments.find(a => a.id === selectedAppointment)?.notes || '');
    setNoteStatus('idle');
    setDialogPos({ x: 0, y: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAppointment]);

  const startDialogDrag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea, a')) return;
    e.preventDefault();
    const originX = e.clientX - dialogPos.x;
    const originY = e.clientY - dialogPos.y;
    const move = (ev: PointerEvent) => setDialogPos({ x: ev.clientX - originX, y: ev.clientY - originY });
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment || !updateAppointment) return;
    setNoteStatus('saving');
    try {
      await updateAppointment(selectedAppointment, { notes: noteDraft });
      setNoteStatus('saved');
    } catch (err) {
      console.error('Failed to save notes:', err);
      setNoteStatus('idle');
    }
  };

  // New Appointment State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newAppointmentData, setNewAppointmentData] = useState({
    customer_name: '',
    start_time: '',
    type: 'Consultation',
    status: 'Pending' as const,
    notes: ''
  });

  // Drag State
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    appointmentId: null,
    originalStart: null,
    currentDropTarget: null
  });

  // Time Configuration
  const START_HOUR = show24Hours ? 0 : 7;
  const END_HOUR = show24Hours ? 24 : 21;
  const TOTAL_HOURS = END_HOUR - START_HOUR;

  // Calculate visible days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(() => {
    if (viewMode === 'day') {
      return [currentDate];
    }
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
    return showWeekend ? days : days.slice(0, 5);
  }, [weekStart, showWeekend, viewMode, currentDate]);

  const hours = useMemo(() =>
    Array.from({ length: TOTAL_HOURS }).map((_, i) => START_HOUR + i),
    [START_HOUR, TOTAL_HOURS]
  );

  // ============ HELPER FUNCTIONS ============
  const getZonedTime = useCallback((dateStr: string) => {
    try {
      if (!dateStr) return new Date();
      // The backend returns ISO string in UTC or with offset (e.g. 2026-01-29T17:00:00-05:00).
      // The browser's Date object automatically handles conversion to the system's local time.
      // If we want to display it in the BUSINESS timezone (e.g. EST), we should use toZonedTime.
      // However, if the dateStr already contains timezone info (offset), passing it to new Date() is safer.

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return new Date();

      // Convert the absolute UTC time to the target timezone's wall time
      return toZonedTime(date, timezone);
    } catch (e) {
      console.error('Error in getZonedTime:', e);
      return new Date();
    }
  }, [timezone]);

  const formatHour = useCallback((hour: number): string => {
    if (timeFormat === '24h') {
      return `${hour.toString().padStart(2, '0')}:00`;
    }
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  }, [timeFormat]);

  const formatTime = useCallback((date: Date): string => {
    if (timeFormat === '24h') {
      return format(date, 'HH:mm');
    }
    return format(date, 'h:mm a');
  }, [timeFormat]);

  const getDayAppointments = useCallback((day: Date): Appointment[] => {
    return appointments.filter(appt => {
      const matchesDay = isSameDay(getZonedTime(appt.start_time), day);
      if (!matchesDay) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          appt.customer_name?.toLowerCase().includes(query) ||
          appt.notes?.toLowerCase().includes(query) ||
          appt.type?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [appointments, getZonedTime, searchQuery]);

  // Check if appointment is in night hours (before 7 AM or after 9 PM)
  const isNightAppointment = useCallback((appt: Appointment): boolean => {
    const hour = getHours(getZonedTime(appt.start_time));
    return hour < 7 || hour >= 21;
  }, [getZonedTime]);

  // Calculate appointment position with overlap handling
  const getAppointmentPosition = (appt: Appointment, dayAppts: Appointment[]) => {
    const start = getZonedTime(appt.start_time);
    const end = getZonedTime(appt.end_time);

    const startHour = getHours(start) + getMinutes(start) / 60;
    const endHour = getHours(end) + getMinutes(end) / 60;

    // Clamp to visible range
    const visibleStart = Math.max(startHour, START_HOUR);
    const visibleEnd = Math.min(endHour, END_HOUR);

    const top = ((visibleStart - START_HOUR) / TOTAL_HOURS) * 100;
    const height = ((visibleEnd - visibleStart) / TOTAL_HOURS) * 100;

    // Find overlapping appointments
    const overlapping = dayAppts.filter(other => {
      if (other.id === appt.id) return false;
      const otherStart = getZonedTime(other.start_time);
      const otherEnd = getZonedTime(other.end_time);
      return start < otherEnd && end > otherStart;
    });

    // Sort for consistent column assignment
    const sortedGroup = [...overlapping, appt].sort((a, b) => {
      const aStart = getZonedTime(a.start_time).getTime();
      const bStart = getZonedTime(b.start_time).getTime();
      if (aStart !== bStart) return aStart - bStart;
      return a.id.localeCompare(b.id);
    });

    const columnIndex = sortedGroup.findIndex(a => a.id === appt.id);
    const totalColumnsCount = sortedGroup.length;

    // Calculate width and position with gaps
    const gap = 2; // pixels

    // Ensure cards don't get too narrow when many overlap
    const minWidth = isMobile ? 40 : 25; // Minimum width percentage
    const maxColumns = Math.floor(100 / minWidth);
    const effectiveColumns = Math.min(totalColumnsCount, maxColumns);
    const columnWidth = 100 / Math.max(1, effectiveColumns);

    // Stagger them slightly if they exceed maxColumns
    const left = (columnIndex % maxColumns) * (100 / maxColumns);

    // If they overlap, add a slight offset for visibility
    const xOffset = columnIndex > 0 ? (columnIndex * 4) : 0;

    return {
      top: `${Math.max(0, top)}%`,
      height: `${Math.max(4, height)}%`, // Increased min height for better visibility
      left: `calc(${left}% + ${gap + xOffset}px)`,
      width: `calc(${columnWidth}% - ${gap * 2 + xOffset}px)`,
      rawTop: top,
      rawHeight: height,
      isPartiallyVisible: startHour < START_HOUR || endHour > END_HOUR,
      isBeforeVisible: startHour < START_HOUR,
      isAfterVisible: endHour > END_HOUR
    };
  };

  // ============ DRAG & DROP ============
  const handleDragStart = (e: React.DragEvent, appt: Appointment) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', appt.id);

    // Custom drag image - use DOM manipulation instead of innerHTML to prevent XSS
    const ghost = document.createElement('div');
    ghost.className = 'px-3 py-2 rounded-lg shadow-xl text-sm font-medium';
    ghost.style.backgroundColor = DS.electric;
    ghost.style.color = 'white';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';

    // Safe DOM manipulation (no XSS risk)
    const nameSpan = document.createElement('span');
    nameSpan.className = 'font-bold';
    nameSpan.textContent = appt.customer_name;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'text-xs opacity-80';
    timeSpan.textContent = formatTime(getZonedTime(appt.start_time));

    const br = document.createElement('br');

    ghost.appendChild(nameSpan);
    ghost.appendChild(br);
    ghost.appendChild(timeSpan);

    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 50, 20);
    setTimeout(() => document.body.removeChild(ghost), 0);

    setDragState({
      isDragging: true,
      appointmentId: appt.id,
      originalStart: getZonedTime(appt.start_time),
      currentDropTarget: null
    });
  };

  const handleDragOver = (e: React.DragEvent, day: Date, hour: number, minute: number = 0) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (dragState.isDragging) {
      setDragState(prev => ({
        ...prev,
        currentDropTarget: { day, hour, minute }
      }));
    }
  };

  const handleDrop = async (e: React.DragEvent, day: Date, hour: number, minute: number = 0) => {
    e.preventDefault();

    const appointmentId = e.dataTransfer.getData('text/plain');
    const appointment = appointments.find(a => a.id === appointmentId);

    if (!appointment || !updateAppointment) return;

    const originalStart = getZonedTime(appointment.start_time);
    const originalEnd = getZonedTime(appointment.end_time);
    const durationMinutes = (originalEnd.getTime() - originalStart.getTime()) / (1000 * 60);

    // Snap to 15-minute intervals
    const snappedMinute = Math.round(minute / 15) * 15;

    let newStart = setHours(day, hour);
    newStart = setMinutes(newStart, snappedMinute);
    const newEnd = addMinutes(newStart, durationMinutes);

    try {
      await updateAppointment(appointmentId, {
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString()
      });
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }

    setDragState({
      isDragging: false,
      appointmentId: null,
      originalStart: null,
      currentDropTarget: null
    });
  };

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      appointmentId: null,
      originalStart: null,
      currentDropTarget: null
    });
  };

  // ============ STATUS COLORS ============
  // Google Calendar-style chips: solid fill, white text, no border.
  const getAppointmentColors = (appt: Appointment) => {
    if (appt.status === 'Canceled') {
      return { bg: 'bg-slate-200', hover: 'hover:bg-slate-300', text: 'text-slate-500' };
    }
    if (appt.status === 'Pending') {
      return { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-white' };
    }
    if (appt.status === 'Scheduled' || appt.status === 'Confirmed') {
      return { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-white' };
    }
    if (appt.type === 'Strategy') {
      return { bg: 'bg-violet-500', hover: 'hover:bg-violet-600', text: 'text-white' };
    }
    if (appt.type === 'Consultation') {
      return { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', text: 'text-white' };
    }
    return { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-white' };
  };

  const getRowHeight = () => {
    return isMobile ? 'h-16' : 'h-14'; // GCal-like density; fixed height for scrolling
  };

  const selectedApptData = appointments.find(a => a.id === selectedAppointment);

  // ============ EDIT HANDLERS ============
  const handleStartEdit = () => {
    if (selectedApptData) {
      setEditForm(selectedApptData);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedAppointment || !updateAppointment) return;
    try {
      // notes live in the side pane; include the draft so it isn't overwritten with a stale value
      await updateAppointment(selectedAppointment, { ...editForm, notes: noteDraft });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
    setIsEditing(false);
    setEditForm({});
    setConfirmingDelete(false);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newAppointmentData.start_time || !newAppointmentData.customer_name) {
        alert('Please fill in all required fields');
        return;
      }

      await createAppointment({
        ...newAppointmentData,
        start_time: new Date(newAppointmentData.start_time).toISOString(),
        end_time: addMinutes(new Date(newAppointmentData.start_time), 60).toISOString(),
        title: newAppointmentData.type,
      });
      setIsNewModalOpen(false);
      setNewAppointmentData({
        customer_name: '',
        start_time: '',
        type: 'Consultation',
        status: 'Pending',
        notes: ''
      });
    } catch (err) {
      console.error('Failed to create appointment', err);
      alert('Failed to create appointment');
    }
  };

  if (isInitialLoading) {
    return (
      <DashboardLayout fullWidth>
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto" style={{ borderColor: DS.border, borderTopColor: DS.electric }} />
            <p className="mt-4 font-medium" style={{ color: DS.stone }}>Loading appointments...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout fullWidth>
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: DS.dangerBg }}>
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: DS.ink }}>Unable to load appointments</h3>
            <p className="mb-6" style={{ color: DS.stone }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: DS.electric }}
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout fullWidth>
      <div className="w-full h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header removed — content moves up */}

        {/* Toolbar — Google Calendar style: Today · chevrons · big month title | options · view · create */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${isMobile ? 'px-4 py-2' : 'px-6 py-3'} border-b`} style={{ borderColor: DS.border, backgroundColor: DS.white }}>
          <div className="flex items-center w-full sm:w-auto gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentDate(toZonedTime(new Date(), timezone))}
              className="px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full border transition-colors hover:bg-slate-50"
              style={{ color: DS.ink, borderColor: 'rgb(var(--twc-slate-300))', backgroundColor: DS.white }}
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(d => addDays(d, viewMode === 'day' ? -1 : -7))}
              aria-label="Previous"
              className="p-2 rounded-full transition-colors hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: DS.stone }} />
            </button>
            <button
              onClick={() => setCurrentDate(d => addDays(d, viewMode === 'day' ? 1 : 7))}
              aria-label="Next"
              className="p-2 rounded-full transition-colors hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: DS.stone }} />
            </button>
            <h2 className="ml-1 sm:ml-2 text-base sm:text-xl font-normal whitespace-nowrap" style={{ color: DS.ink }}>
              {viewMode === 'day'
                ? format(currentDate, 'MMMM d, yyyy')
                : format(weekStart, 'MMMM yyyy')
              }
            </h2>
          </div>

          <div className={`flex items-center gap-1.5 ${isMobile ? 'w-full justify-end' : ''}`}>
            <button
              onClick={() => setShow24Hours(!show24Hours)}
              title={show24Hours ? "Show business hours" : "Show 24 hours"}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-slate-100"
              style={{ color: show24Hours ? DS.electric : DS.stone }}
            >
              {show24Hours ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button
              onClick={() => setTimeFormat(f => f === '12h' ? '24h' : '12h')}
              title={`Switch to ${timeFormat === '12h' ? '24h' : '12h'} format`}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-slate-100"
              style={{ color: DS.stone }}
            >
              <Clock size={17} />
            </button>
            {viewMode === 'week' && (
              <button
                onClick={() => setShowWeekend(!showWeekend)}
                title={showWeekend ? "Hide weekends" : "Show weekends"}
                className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-slate-100"
                style={{ color: showWeekend ? DS.stone : DS.electric }}
              >
                <Layers size={17} />
              </button>
            )}

            {/* View switcher */}
            <div className="ml-1 flex p-0.5 rounded-full border" style={{ borderColor: 'rgb(var(--twc-slate-300))' }}>
              {(['day', 'week'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium rounded-full transition-all capitalize ${viewMode === mode ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                  style={{ color: viewMode === mode ? DS.electric : DS.stone }}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="hidden lg:flex flex-shrink-0 items-center gap-2 ml-1 pl-3 pr-4 h-10 text-white rounded-2xl shadow-md transition-all active:scale-95 text-sm font-medium"
              style={{ backgroundColor: DS.electric }}
            >
              <Plus size={18} />
              Create
            </button>
          </div>
        </div>

        {/* ============ CALENDAR GRID ============ */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

          {/* Days Header — GCal: small weekday caps over a large date, today gets a filled circle */}
          <div
            className="flex-shrink-0 grid border-b"
            style={{
              gridTemplateColumns: viewMode === 'day' && !isMobile
                ? `${isMobile ? '50px' : '65px'} repeat(${weekDays.length}, 1fr) 320px`
                : `${isMobile ? '50px' : '65px'} repeat(${weekDays.length}, 1fr)`,
              borderColor: DS.border,
              backgroundColor: DS.white
            }}
          >
            <div />
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={i}
                  className={`flex flex-col items-center ${isMobile ? 'py-1.5' : 'py-2'} border-r`}
                  style={{ borderColor: DS.border }}
                >
                  <span
                    className="text-[10px] md:text-[11px] font-medium uppercase tracking-wide"
                    style={{ color: isToday ? DS.electric : DS.subtleText }}
                  >
                    {format(day, 'EEE')}
                  </span>
                  <button
                    onClick={() => { setCurrentDate(day); setViewMode('day'); }}
                    className={`mt-0.5 flex items-center justify-center rounded-full transition-colors ${isMobile ? 'w-8 h-8 text-base' : 'w-11 h-11 text-xl md:text-2xl'} ${isToday
                      ? 'text-white bg-blue-600 hover:bg-blue-700'
                      : 'hover:bg-slate-100'
                      }`}
                    style={isToday ? undefined : { color: DS.ink }}
                    aria-label={format(day, 'EEEE, MMMM d')}
                  >
                    {format(day, 'd')}
                  </button>
                </div>
              );
            })}
            {/* Schedule Sidebar Header */}
            {viewMode === 'day' && !isMobile && (
              <div className="flex flex-col items-center justify-center py-2 border-l" style={{ borderColor: DS.border }}>
                <h3 className="text-xs font-bold" style={{ color: DS.ink }}>Schedule</h3>
              </div>
            )}
          </div>

          {/* Time Grid - Scrollable Container */}
          <div
            className={`flex-1 grid overflow-y-auto relative custom-scrollbar ${isMobile ? 'pb-24' : ''}`}
            style={{
              gridTemplateColumns: viewMode === 'day' && !isMobile
                ? `${isMobile ? '50px' : '65px'} repeat(${weekDays.length}, 1fr) 320px`
                : `${isMobile ? '50px' : '65px'} repeat(${weekDays.length}, 1fr)`
            }}
          >

            {/* Time Column — labels float on the hour line, GCal style */}
            <div className="border-r sticky left-0 z-10 flex flex-col h-full" style={{ backgroundColor: DS.white, borderColor: DS.border }}>
              {hours.map((hour, hourIndex) => {
                const isLastHour = hourIndex === hours.length - 1;
                return (
                  <div
                    key={hour}
                    className={`${getRowHeight()} relative ${isLastHour ? 'mb-20' : ''}`}
                  >
                    {hourIndex > 0 && (
                      <span className="absolute -top-2 right-2 md:right-3 text-[10px] md:text-[11px] font-medium text-slate-400">
                        {formatHour(hour)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Day Columns */}
            {weekDays.map((day, dayIndex) => {
              const dayAppts = getDayAppointments(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={dayIndex}
                  className="border-r relative flex flex-col transition-colors"
                  style={{ borderColor: DS.border }}
                >
                  {/* Hour Rows */}
                  {hours.map((hour, hourIndex) => {
                    const isLastHour = hourIndex === hours.length - 1;
                    const isDropTarget = dragState.currentDropTarget?.day &&
                      isSameDay(dragState.currentDropTarget.day, day) &&
                      dragState.currentDropTarget.hour === hour;

                    return (
                      <div
                        key={hour}
                        className={`${getRowHeight()} border-b transition-colors ${isDropTarget ? 'bg-blue-100/50 border-blue-300' : ''} ${dragState.isDragging ? 'cursor-copy' : ''
                          } ${isLastHour ? 'mb-20' : ''}`} // Add margin to last hour for mobile scroll space
                        style={{ borderColor: DS.border }}
                        onDragOver={(e) => handleDragOver(e, day, hour, 0)}
                        onDrop={(e) => handleDrop(e, day, hour, 0)}
                      >
                        {/* 15-minute slots for precise drop */}
                        {dragState.isDragging && (
                          <div className="h-full grid grid-rows-4">
                            {[0, 15, 30, 45].map(minute => {
                              const isSlotTarget = isDropTarget &&
                                dragState.currentDropTarget?.minute === minute;
                              return (
                                <div
                                  key={minute}
                                  className={`transition-colors ${isSlotTarget ? 'bg-blue-200' : 'hover:bg-blue-50'
                                    }`}
                                  onDragOver={(e) => handleDragOver(e, day, hour, minute)}
                                  onDrop={(e) => handleDrop(e, day, hour, minute)}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Current Time Line */}
                  {isToday && (() => {
                    const now = new Date();
                    const currentHour = getHours(now) + getMinutes(now) / 60;
                    if (currentHour >= START_HOUR && currentHour <= END_HOUR) {
                      const topPercent = ((currentHour - START_HOUR) / TOTAL_HOURS) * 100;
                      return (
                        <div
                          className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                          style={{ top: `${topPercent}%` }}
                        >
                          <div className="w-3 h-3 rounded-full ring-2 ring-white shadow-lg animate-pulse" style={{ backgroundColor: DS.danger }} />
                          <div className="h-0.5 flex-1" style={{ backgroundColor: DS.danger }} />
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Appointments */}
                  {dayAppts.map(appt => {
                    const pos = getAppointmentPosition(appt, dayAppts);
                    const isSelected = selectedAppointment === appt.id;
                    const isDragging = dragState.appointmentId === appt.id;
                    const colors = getAppointmentColors(appt);
                    const isNight = isNightAppointment(appt);

                    return (
                      <div
                        key={appt.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, appt)}
                        onDragEnd={handleDragEnd}
                        className={`absolute ${colors.bg} ${colors.hover} ${colors.text}
                        rounded cursor-grab active:cursor-grabbing
                        transition-colors duration-150 group overflow-hidden
                        hover:shadow-md hover:z-30
                        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1 z-40 shadow-md' : 'z-20'}
                        ${isDragging ? 'opacity-40 scale-95 shadow-none' : ''}
                        ${appt.status === 'Canceled' ? 'opacity-70 line-through shadow-none' : ''}`}
                        style={{
                          top: pos.top,
                          height: pos.height,
                          left: pos.left,
                          width: pos.width,
                          minHeight: isMobile ? '32px' : '28px'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSelected) {
                            handleCloseModal();
                          } else {
                            setSelectedAppointment(appt.id);
                            setIsEditing(false);
                          }
                        }}
                      >
                        {/* Night Indicator */}
                        {isNight && (
                          <div className="absolute top-1 md:top-1.5 right-1 md:right-1.5 z-10">
                            <Moon className="w-2.5 h-2.5 md:w-3 md:h-3 text-white/80" />
                          </div>
                        )}

                        {/* Drag Handle - Hidden on mobile */}
                        {!isMobile && (
                          <div className="absolute top-1 left-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab z-10">
                            <GripVertical className="w-3.5 h-3.5 text-white/60" />
                          </div>
                        )}

                        {/* Partial visibility indicators */}
                        {pos.isBeforeVisible && (
                          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-white/50 z-10" />
                        )}
                        {pos.isAfterVisible && (
                          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-white/50 z-10" />
                        )}

                        <div className={`h-full flex flex-col justify-start relative z-0 ${isMobile ? 'px-1.5 py-1' : 'px-2 py-1'}`}>
                          <p className={`!text-inherit font-medium truncate leading-tight ${isMobile ? 'text-[11px]' : 'text-xs'}`}>
                            {appt.customer_name}
                            {pos.rawHeight <= (isMobile ? 2.5 : 3.5) && (
                              <span className="font-normal">, {formatTime(getZonedTime(appt.start_time))}</span>
                            )}
                          </p>

                          {pos.rawHeight > (isMobile ? 2.5 : 3.5) && (
                            <p className={`!text-inherit truncate font-normal ${isMobile ? 'text-[10px]' : 'text-[11px]'}`}>
                              {formatTime(getZonedTime(appt.start_time))} – {formatTime(getZonedTime(appt.end_time))}
                            </p>
                          )}

                          {pos.rawHeight > (isMobile ? 5 : 6) && (
                            <p className={`!text-inherit mt-0.5 truncate font-normal ${isMobile ? 'text-[10px]' : 'text-[11px]'}`}>
                              {appt.title}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Appointment Schedule Sidebar - Using AppointmentSchedule Component */}
            {viewMode === 'day' && !isMobile && (
              <div className="border-l flex flex-col overflow-hidden" style={{ borderColor: DS.border, backgroundColor: DS.white }}>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4">
                    <AppointmentSchedule
                      appointments={getDayAppointments(currentDate).map(appt => ({
                        id: appt.id,
                        startTimeIso: appt.start_time,
                        formattedTime: formatTime(getZonedTime(appt.start_time)),
                        customer_name: appt.customer_name || 'Unknown',
                        service_type: appt.type || appt.title || 'Appointment'
                      }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============ APPOINTMENT DETAIL DIALOG — GCal-style event card ============ */}
        {selectedAppointment && selectedApptData && (() => {
          const chipBg = getAppointmentColors(selectedApptData).bg;
          const start = getZonedTime(selectedApptData.start_time);
          const end = getZonedTime(selectedApptData.end_time);
          const statusPill =
            selectedApptData.status === 'Canceled' ? 'bg-slate-100 text-slate-500' :
            selectedApptData.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
            'bg-emerald-50 text-emerald-700';
          const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all";
          const inputStyle = { borderColor: 'rgb(var(--twc-slate-300))', color: DS.ink, backgroundColor: DS.white } as React.CSSProperties;
          return (
            <div className="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
              {/* click-away layer — no dimming, calendar stays normal */}
              <div
                className="fixed inset-0"
                onClick={handleCloseModal}
              />

              <div className="fixed inset-0 z-10 w-screen overflow-y-auto pointer-events-none">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  {/* vs-light: the event card is always the white surface, in both themes */}
                  <div
                    className="vs-light pointer-events-auto relative overflow-hidden rounded-2xl text-left shadow-2xl ring-1 ring-black/10 sm:my-8 sm:w-full sm:max-w-4xl animate-in fade-in zoom-in-95 duration-200"
                    style={{ backgroundColor: DS.white, transform: `translate(${dialogPos.x}px, ${dialogPos.y}px)` }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Icon action bar — drag handle */}
                    <div
                      className="flex items-center justify-end gap-0.5 px-3 pt-3 cursor-move select-none touch-none"
                      onPointerDown={startDialogDrag}
                    >
                      {!isEditing && !confirmingDelete && (
                        <>
                          <button
                            onClick={handleStartEdit}
                            title="Edit appointment"
                            className="p-2 rounded-full transition-colors hover:bg-slate-100"
                            style={{ color: DS.stone }}
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            onClick={() => setConfirmingDelete(true)}
                            title="Delete appointment"
                            className="p-2 rounded-full transition-colors hover:bg-slate-100"
                            style={{ color: DS.stone }}
                          >
                            <Trash2 size={17} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={handleCloseModal}
                        aria-label="Close"
                        className="p-2 rounded-full transition-colors hover:bg-slate-100"
                        style={{ color: DS.stone }}
                      >
                        <X size={19} />
                      </button>
                    </div>

                    <div className="md:grid md:grid-cols-[minmax(0,1fr)_360px]">
                      {/* LEFT — event details */}
                      <div className="px-6 pb-6 pt-1">
                        {/* Title row: color square + name + when */}
                        <div className="flex items-start gap-4">
                          <span className={`mt-2 w-4 h-4 rounded flex-shrink-0 ${chipBg}`} />
                          <div className="min-w-0 flex-1">
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editForm.customer_name || ''}
                                  onChange={e => setEditForm(prev => ({ ...prev, customer_name: e.target.value }))}
                                  className={`${inputCls} text-lg`}
                                  style={inputStyle}
                                  placeholder="Customer name"
                                />
                                <input
                                  type="text"
                                  value={editForm.title || ''}
                                  onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                  className={inputCls}
                                  style={inputStyle}
                                  placeholder="Appointment type"
                                />
                              </div>
                            ) : (
                              <>
                                <h2 id="modal-title" className="text-xl md:text-2xl font-normal leading-snug" style={{ color: DS.ink }}>
                                  {selectedApptData.customer_name}
                                </h2>
                                <p className="mt-0.5 text-sm" style={{ color: DS.stone }}>
                                  {format(start, 'EEEE, MMMM d')} <span className="px-0.5">⋅</span> {formatTime(start)} – {formatTime(end)}
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Detail rows */}
                        <div className="mt-6 space-y-4">
                          <div className="flex items-center gap-4">
                            <Layers size={17} className="flex-shrink-0" style={{ color: DS.subtleText }} />
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm truncate" style={{ color: DS.ink }}>
                                {selectedApptData.title || selectedApptData.type || 'Consultation'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusPill}`}>
                                {selectedApptData.status}
                              </span>
                              {isNightAppointment(selectedApptData) && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600">
                                  <Moon size={10} />
                                  Night
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <MapPin size={17} className="flex-shrink-0" style={{ color: DS.subtleText }} />
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.location || ''}
                                onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                                className={inputCls}
                                style={inputStyle}
                                placeholder="Add location"
                              />
                            ) : (
                              <span className="text-sm truncate" style={{ color: DS.ink }}>
                                {selectedApptData.location || 'Virtual — online / remote'}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <Phone size={17} className="flex-shrink-0" style={{ color: DS.subtleText }} />
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.phone || ''}
                                onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                className={inputCls}
                                style={inputStyle}
                                placeholder="Add phone"
                              />
                            ) : selectedApptData.phone ? (
                              <a
                                href={`tel:${selectedApptData.phone}`}
                                className="text-sm hover:underline"
                                style={{ color: DS.electric }}
                              >
                                {selectedApptData.phone}
                              </a>
                            ) : (
                              <span className="text-sm" style={{ color: DS.stone }}>No phone on file</span>
                            )}
                          </div>
                        </div>

                        {/* Edit / delete-confirm actions */}
                        {isEditing && (
                          <div className="mt-6 flex items-center gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-5 py-2 text-sm font-medium text-white rounded-full transition-all active:scale-95"
                              style={{ backgroundColor: DS.electric }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-5 py-2 text-sm font-medium rounded-full transition-colors hover:bg-slate-100"
                              style={{ color: DS.stone }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {confirmingDelete && (
                          <div className="mt-6 flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: DS.dangerBg }}>
                            <p className="text-sm font-medium" style={{ color: DS.danger }}>
                              Delete this appointment?
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setConfirmingDelete(false)}
                                className="px-4 py-1.5 text-sm font-medium rounded-full transition-colors hover:bg-slate-100"
                                style={{ color: DS.stone }}
                              >
                                Keep
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await deleteAppointment(selectedAppointment!);
                                    handleCloseModal();
                                  } catch (err) {
                                    console.error('Failed to delete:', err);
                                    setConfirmingDelete(false);
                                  }
                                }}
                                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white rounded-full transition-all active:scale-95"
                                style={{ backgroundColor: DS.danger }}
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* RIGHT — notes, always editable, saves independently */}
                      <div className="flex flex-col border-t md:border-t-0 md:border-l" style={{ borderColor: DS.border, backgroundColor: DS.surface }}>
                        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText size={15} style={{ color: 'rgb(var(--twc-amber-500))' }} />
                            <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: DS.stone }}>Notes</h3>
                          </div>
                          {noteStatus === 'saved' && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--twc-emerald-500))' }}>Saved</span>
                          )}
                        </div>
                        <textarea
                          value={noteDraft}
                          onChange={e => { setNoteDraft(e.target.value); if (noteStatus === 'saved') setNoteStatus('idle'); }}
                          placeholder={'Notes only you and your team see.\n\nCapture context that makes the next call better — preferences, follow-ups promised, pricing discussed, no-show history…'}
                          className="flex-1 w-full resize-none px-4 py-3 text-base leading-relaxed focus:outline-none bg-transparent min-h-[260px] md:min-h-[300px]"
                          style={{ color: DS.ink }}
                        />
                        <div className="p-3 border-t" style={{ borderColor: DS.border }}>
                          <button
                            onClick={handleSaveNotes}
                            disabled={noteStatus === 'saving' || noteDraft === (selectedApptData.notes || '')}
                            className="w-full px-4 py-2 font-medium text-white rounded-full active:scale-95 transition-all text-sm disabled:opacity-40 disabled:active:scale-100"
                            style={{ backgroundColor: DS.electric }}
                          >
                            {noteStatus === 'saving' ? 'Saving…' : 'Save Notes'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ============ NEW APPOINTMENT MODAL ============ */}
        {isNewModalOpen && (
          <>
            <div
              className="fixed inset-0 backdrop-blur-sm z-[100]"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              onClick={() => setIsNewModalOpen(false)}
            />
            <div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              rounded-2xl shadow-2xl border z-[101] 
              w-full max-w-md overflow-hidden"
              style={{ backgroundColor: DS.white, borderColor: DS.border }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5" style={{ backgroundColor: DS.electric }}>
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-bold text-white">New Appointment</h2>
                  <button
                    onClick={() => setIsNewModalOpen(false)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateAppointment} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: DS.stone }}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newAppointmentData.customer_name}
                    onChange={e => setNewAppointmentData(prev => ({ ...prev, customer_name: e.target.value }))}
                    className="w-full rounded-xl px-3 py-2 text-sm font-medium"
                    style={{ backgroundColor: DS.white, border: '1px solid rgb(var(--twc-slate-200))', color: DS.ink }}
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: DS.stone }}>
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newAppointmentData.start_time}
                    onChange={e => setNewAppointmentData(prev => ({ ...prev, start_time: e.target.value }))}
                    className="w-full rounded-xl px-3 py-2 text-sm font-medium"
                    style={{ backgroundColor: DS.white, border: '1px solid rgb(var(--twc-slate-200))', color: DS.ink }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: DS.stone }}>
                    Type
                  </label>
                  <select
                    value={newAppointmentData.type}
                    onChange={e => setNewAppointmentData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full rounded-xl px-3 py-2 text-sm font-medium"
                    style={{ backgroundColor: DS.white, border: '1px solid rgb(var(--twc-slate-200))', color: DS.ink }}
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Demo">Demo</option>
                    <option value="Review">Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: DS.stone }}>
                    Notes
                  </label>
                  <textarea
                    value={newAppointmentData.notes}
                    onChange={e => setNewAppointmentData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-xl px-3 py-2 text-sm font-medium resize-none"
                    style={{ backgroundColor: DS.white, border: '1px solid rgb(var(--twc-slate-200))', color: DS.ink }}
                    rows={3}
                    placeholder="Add any notes..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors shadow-lg active:scale-95"
                    style={{ backgroundColor: DS.electric }}
                  >
                    Create Appointment
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl font-medium border transition-colors active:scale-95"
                    style={{ backgroundColor: DS.white, borderColor: DS.border }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = DS.offWhite; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = DS.white; }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* ============ LEGEND ============ */}
        {!isMobile && (
          <footer className="flex-shrink-0 border-t px-4 py-2" style={{ borderColor: DS.border, backgroundColor: DS.surface }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs">
                <span className="font-medium" style={{ color: DS.stone }}>Legend:</span>
                {[
                  { color: 'bg-blue-500', label: 'Confirmed' }, // Indigo/Blue
                  { color: 'bg-amber-500', label: 'Pending' },
                  { color: 'bg-purple-500', label: 'Strategy' },
                  { color: 'bg-emerald-500', label: 'Consultation' },
                  { color: 'bg-gray-400', label: 'Canceled' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded ${item.color}`} />
                    <span style={{ color: DS.charcoal }}>{item.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 ml-2 pl-2" style={{ borderLeftColor: DS.border }}>
                  <Moon className="w-3 h-3 text-indigo-400" />
                  <span style={{ color: DS.charcoal }}>Night Appointment</span>
                </div>
              </div>
              <div className="text-xs" style={{ color: DS.subtleText }}>
                Drag appointments to reschedule • Click to view details
              </div>
            </div>
          </footer>
        )}

        {/* Floating Action Button for Mobile */}
        {isMobile && (
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[60] active:scale-90 transition-transform"
            style={{ boxShadow: '0 8px 30px rgba(79, 70, 229, 0.4)' }}
          >
            <Plus size={28} />
          </button>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FullScreenAppointments;
