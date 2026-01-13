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
  X, Layers, FileText, GripVertical, MapPin, Phone,
  Calendar as CalendarIcon
} from 'lucide-react';

import { 
  toZonedTime 
} from 'date-fns-tz';

// --- DESIGN SYSTEM COLORS (Consistent with DashboardLayout) ---
const DS = {
  white: '#FFFFFF',
  surface: '#FAFBFC',
  offWhite: '#F5F7FA',
  border: '#CBD5E1',
  ink: '#1F2937',
  charcoal: '#374151',
  stone: '#4B5563',
  subtleText: '#9CA3AF',
  electric: '#3B82F6',
  electricDark: '#2563EB',
  electricLight: '#EFF6FF',
  electricTint: 'rgba(59, 130, 246, 0.1)',
  danger: '#EF4444',
  dangerBg: '#FEF2F2'
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
  const { appointments, loading, isPlaceholderData, error, updateAppointment, createAppointment } = useAppointments();
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
      if (!dateStr) return toZonedTime(new Date(), timezone);
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return toZonedTime(new Date(), timezone);
      return toZonedTime(date, timezone);
    } catch (e) {
      console.error('Error in getZonedTime:', e);
      return toZonedTime(new Date(), timezone);
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
    
    // Custom drag image
    const ghost = document.createElement('div');
    ghost.className = 'px-3 py-2 rounded-lg shadow-xl text-sm font-medium';
    ghost.style.backgroundColor = DS.electric;
    ghost.style.color = 'white';
    ghost.innerHTML = `<span class="font-bold">${appt.customer_name}</span><br/><span class="text-xs opacity-80">${formatTime(getZonedTime(appt.start_time))}</span>`;
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
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
  const getAppointmentColors = (appt: Appointment) => {
    const isNight = isNightAppointment(appt);

    if (appt.status === 'Canceled') {
      return {
        bg: 'bg-slate-400/90',
        hover: 'hover:bg-slate-500',
        border: 'border-slate-500/50',
        text: 'text-white',
        dot: 'bg-slate-500'
      };
    }
    
    // Status-based colors
    if (appt.status === 'Pending') {
      return {
        bg: isNight ? 'bg-amber-600/95' : 'bg-amber-500/90',
        hover: 'hover:bg-amber-600',
        border: 'border-amber-700/30',
        text: 'text-white',
        dot: 'bg-amber-500'
      };
    }
    
    if (appt.status === 'Scheduled' || appt.status === 'Confirmed') {
      return {
        bg: isNight ? 'bg-indigo-700/95' : 'bg-indigo-600/90',
        hover: 'hover:bg-indigo-700',
        border: 'border-indigo-800/30',
        text: 'text-white',
        dot: 'bg-indigo-600'
      };
    }

    // Type-based fallback colors
    if (appt.type === 'Strategy') {
      return {
        bg: isNight ? 'bg-purple-700/95' : 'bg-purple-500/90',
        hover: 'hover:bg-purple-600',
        border: 'border-purple-600/30',
        text: 'text-white',
        dot: 'bg-purple-500'
      };
    }
    if (appt.type === 'Consultation') {
      return {
        bg: isNight ? 'bg-emerald-700/95' : 'bg-emerald-500/90',
        hover: 'hover:bg-emerald-600',
        border: 'border-emerald-600/30',
        text: 'text-white',
        dot: 'bg-emerald-500'
      };
    }
    
    // Default fallback
    return {
      bg: isNight ? 'bg-blue-700/95' : 'bg-blue-600/90',
      hover: 'hover:bg-blue-700',
      border: 'border-blue-800/30',
      text: 'text-white',
      dot: 'bg-blue-600'
    };
  };

  const getRowHeight = () => {
    return isMobile ? 'h-24' : 'h-20'; // Fixed height for scrolling
  };

  const selectedApptData = appointments.find(a => a.id === selectedAppointment);
  const todayAppts = getDayAppointments(new Date());

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
      await updateAppointment(selectedAppointment, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
    setIsEditing(false);
    setEditForm({});
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
      
        {/* ============ HEADER ============ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-b bg-white" style={{ borderColor: DS.border }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Appointments
                  {isPlaceholderData && (
                    <div className="inline-flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 animate-pulse">
                      <Clock size={10} className="animate-spin-slow" />
                      <span className="text-[8px] font-bold uppercase tracking-wider">Syncing...</span>
                    </div>
                  )}
                </h1>
                <p className="text-slate-500 text-xs font-medium">
                  {viewMode === 'day' ? format(currentDate, 'EEEE, MMMM d, yyyy') : format(currentDate, 'MMMM yyyy')}
                </p>
              </div>
            </div>

            {isMobile && (
              <button 
                onClick={() => setIsNewModalOpen(true)}
                className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 active:scale-95"
              >
                <Plus size={18} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-100 active:scale-95"
            >
              <Plus size={14} />
              New Appointment
            </button>
          </div>
        </div>

          {/* Controls Wrapper */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3 bg-slate-50/50 border-b" style={{ borderColor: DS.border }}>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* View Toggle */}
              <div className="flex p-1 rounded-xl bg-white border shadow-sm" style={{ borderColor: DS.border }}>
              {(['day', 'week'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex-1 sm:flex-none px-5 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                    viewMode === mode 
                      ? 'bg-white shadow-sm' 
                      : 'hover:bg-gray-100'
                  }`}
                  style={{ color: viewMode === mode ? DS.electric : DS.stone }}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentDate(toZonedTime(new Date(), timezone))}
                className="px-4 py-2 text-xs font-bold rounded-xl transition-all"
                style={{ color: DS.charcoal, backgroundColor: DS.offWhite }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DS.border}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = DS.offWhite}
              >
                Today
              </button>
              <div className="flex items-center rounded-xl overflow-hidden" style={{ backgroundColor: DS.offWhite }}>
                <button 
                  onClick={() => setCurrentDate(d => addDays(d, viewMode === 'day' ? -1 : -7))} 
                  className="p-2 transition-colors hover:bg-gray-200"
                >
                  <ChevronLeft className="w-4 h-4" style={{ color: DS.charcoal }} />
                </button>
                <span className="px-4 text-xs font-bold min-w-[120px] text-center" style={{ color: DS.ink }}>
                  {viewMode === 'day' 
                    ? format(currentDate, 'MMM d') 
                    : `${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d')}`
                  }
                </span>
                <button 
                  onClick={() => setCurrentDate(d => addDays(d, viewMode === 'day' ? 1 : 7))} 
                  className="p-2 transition-colors hover:bg-gray-200"
                >
                  <ChevronRight className="w-4 h-4" style={{ color: DS.charcoal }} />
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShow24Hours(!show24Hours)}
                title={show24Hours ? "Switch to Day View" : "Switch to 24h View"}
                className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
                  show24Hours ? 'text-indigo-700' : 'hover:bg-gray-200'
                }`}
                style={{ backgroundColor: show24Hours ? '#EEF2FF' : DS.offWhite, color: show24Hours ? '#4338CA' : DS.charcoal }}
              >
                {show24Hours ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <button
                onClick={() => setTimeFormat(f => f === '12h' ? '24h' : '12h')}
                title={`Switch to ${timeFormat === '12h' ? '24h' : '12h'} format`}
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-colors hover:bg-gray-200"
                style={{ backgroundColor: DS.offWhite, color: DS.charcoal }}
              >
                <Clock size={18} />
              </button>

              {viewMode === 'week' && (
                <button
                  onClick={() => setShowWeekend(!showWeekend)}
                  title={showWeekend ? "Hide Weekends" : "Show Weekends"}
                  className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
                    showWeekend ? 'hover:bg-gray-200' : 'text-orange-700'
                  }`}
                  style={{ backgroundColor: showWeekend ? DS.offWhite : '#FFEDD5', color: showWeekend ? DS.charcoal : '#C2410C' }}
                >
                  <Layers size={18} />
                </button>
              )}

              <button 
                onClick={() => setIsNewModalOpen(true)}
                className="hidden lg:flex flex-shrink-0 items-center justify-center w-10 h-10 text-white rounded-xl shadow-lg transition-all active:scale-95"
                style={{ backgroundColor: DS.electric, boxShadow: `0 10px 15px -3px ${DS.electric}33` }}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* ============ CALENDAR GRID ============ */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
        {/* Days Header */}
        <div
          className="flex-shrink-0 grid border-b-2"
          style={{ 
            gridTemplateColumns: viewMode === 'day' && !isMobile
              ? `${isMobile ? '50px' : '65px'} repeat(${weekDays.length}, 1fr) 320px`
              : `${isMobile ? '50px' : '65px'} repeat(${weekDays.length}, 1fr)`,
            borderColor: DS.border,
            backgroundColor: DS.surface
          }}
        >
          <div className="flex items-center justify-center py-2" style={{ borderRightColor: DS.border }}>
            <Clock className="w-4 h-4" style={{ color: DS.subtleText }} />
          </div>
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const dayAppts = getDayAppointments(day);
            const hasNightAppts = dayAppts.some(isNightAppointment);
            
            return (
              <div
                key={i}
                className={`flex flex-col items-center justify-center py-2 md:py-3 border-r transition-colors ${
                  isToday ? 'bg-blue-50/50' : ''
                }`}
                style={{ borderColor: DS.border }}
              >
                {!isMobile && (
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                      isToday ? DS.electric : DS.stone
                    }`}>
                      {format(day, 'EEE')}
                    </span>
                    {hasNightAppts && !show24Hours && (
                      <Moon className="w-3 h-3 text-indigo-400" />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1 md:mt-2">
                  <span className={`font-bold transition-all duration-300 ${
                    isToday 
                      ? 'text-white bg-blue-600 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full text-sm md:text-lg shadow-lg shadow-blue-200 ring-2 ring-blue-100' 
                      : `${DS.ink} text-sm md:text-lg hover:text-blue-600`
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayAppts.length > 0 && (
                    <span className={`text-[9px] md:text-[10px] font-bold px-2 md:px-2.5 py-0.5 md:py-1 rounded-full shadow-sm transition-all ${
                      isToday ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                    }`}>
                      {dayAppts.length}
                    </span>
                  )}
                </div>
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
          className={`flex-1 grid overflow-y-auto relative custom-scrollbar ${isMobile ? 'pb-32' : ''}`}
          style={{ 
            gridTemplateColumns: viewMode === 'day' && !isMobile
              ? `${isMobile ? '50px' : '65px'} repeat(${weekDays.length}, 1fr) 320px`
              : `${isMobile ? '50px' : '65px'} repeat(${weekDays.length}, 1fr)`
          }}
        >
          
          {/* Time Column */}
          <div className="border-r sticky left-0 z-10 flex flex-col h-full" style={{ backgroundColor: DS.surface, borderColor: DS.border }}>
            {hours.map((hour) => {
              const isNightHour = hour < 7 || hour >= 21;
              const isLastHour = hourIndex === hours.length - 1;
              return (
                <div 
                  key={hour} 
                  className={`${getRowHeight()} flex items-start justify-end pr-2 md:pr-3 pt-2.5 border-b overflow-hidden ${
                    isNightHour ? 'bg-slate-50/50' : ''
                  }`}
                  style={{ borderColor: '#CBD5E1' }}
                >
                  <span className={`text-[10px] md:text-xs font-bold tracking-tight ${
                    isNightHour ? 'text-indigo-400' : 'text-slate-400'
                  }`}>
                    {formatHour(hour)}
                  </span>
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
                className={`border-r relative flex flex-col transition-colors ${
                  isToday ? 'bg-blue-50/30' : ''
                }`}
                style={{ borderColor: DS.border }}
              >
                {/* Hour Rows */}
                {hours.map((hour, hourIndex) => {
                  const isNightHour = hour < 7 || hour >= 21;
                  const isLastHour = hourIndex === hours.length - 1;
                  const isDropTarget = dragState.currentDropTarget?.day && 
                    isSameDay(dragState.currentDropTarget.day, day) && 
                    dragState.currentDropTarget.hour === hour;
                  
                  return (
                    <div 
                      key={hour}
                      className={`${getRowHeight()} border-b transition-colors ${
                        isNightHour ? 'bg-slate-50/50' : ''
                      } ${isDropTarget ? 'bg-blue-100/50 border-blue-300' : ''} ${
                        dragState.isDragging ? 'cursor-copy' : ''
                      } ${isLastHour ? 'mb-20' : ''}`} // Add margin to last hour for mobile scroll space
                      style={{ borderColor: '#CBD5E1' }}
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
                                className={`transition-colors ${
                                  isSlotTarget ? 'bg-blue-200' : 'hover:bg-blue-50'
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
                        rounded-xl md:rounded-xl shadow-md cursor-grab active:cursor-grabbing 
                        transition-all duration-300 group overflow-hidden border-l-[4px] md:border-l-[4px] ${colors.border}
                        backdrop-blur-sm
                        hover:shadow-2xl hover:z-30 hover:scale-[1.02] hover:-translate-y-0.5
                        ${isSelected ? `ring-2 ring-offset-2 ring-${DS.electric} z-40 scale-[1.04] shadow-2xl translate-z-10` : 'z-20'}
                        ${isDragging ? 'opacity-40 scale-95 shadow-none' : ''}
                        ${appt.status === 'Canceled' ? 'opacity-50 grayscale shadow-none' : ''}`}
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
                      {/* Glass effect shine */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

                      {/* Night Indicator */}
                      {isNight && (
                        <div className="absolute top-1 md:top-1.5 right-1 md:right-1.5 z-10">
                          <Moon className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-white/70" />
                        </div>
                      )}
                      
                      {/* Drag Handle - Hidden on mobile */}
                      {!isMobile && (
                        <div className="absolute top-1 left-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab z-10">
                          <GripVertical className="w-3.5 h-3.5 text-white/50" />
                        </div>
                      )}
                      
                      {/* Partial visibility indicators */}
                      {pos.isBeforeVisible && (
                        <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-white/40 rounded-full z-10" />
                      )}
                      {pos.isAfterVisible && (
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-white/40 rounded-full z-10" />
                      )}

                      <div className={`h-full flex flex-col justify-start relative z-0 ${isMobile ? 'px-2 py-1.5' : 'px-3 py-2.5'}`}>
                        <div className="flex items-center justify-between gap-1 mb-0.5 min-w-0">
                          <p className={`font-bold truncate leading-tight flex-1 ${isMobile ? 'text-[11px]' : 'text-xs'}`} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                            {appt.customer_name}
                          </p>
                          {appt.status === 'Confirmed' && (
                            <div className={`rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse flex-shrink-0 ${isMobile ? 'w-1 h-1' : 'w-1.5 h-1.5'}`} />
                          )}
                        </div>

                        {pos.rawHeight > (isMobile ? 2.5 : 3.5) && (
                          <div className="flex items-center gap-1 opacity-95 mt-0.5 min-w-0" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}>
                            <Clock className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} flex-shrink-0`} />
                            <p className={`truncate font-semibold ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
                              {formatTime(getZonedTime(appt.start_time))}
                            </p>
                          </div>
                        )}
                        
                        {pos.rawHeight > (isMobile ? 5 : 6) && (
                          <div className="mt-1 flex items-center gap-1 min-w-0" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}>
                            <div className="w-1 h-1 rounded-full bg-white/60 flex-shrink-0" />
                            <p className={`opacity-90 truncate font-medium ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
                              {appt.title}
                            </p>
                          </div>
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

      {/* ============ APPOINTMENT DETAIL MODAL ============ */}
      {selectedAppointment && selectedApptData && (() => {
        return (
          <div className="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div 
              className="fixed inset-0 backdrop-blur-sm transition-opacity"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
              onClick={handleCloseModal}
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div 
                  className="relative transform overflow-hidden rounded-3xl text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl animate-in slide-in-from-bottom duration-300 sm:zoom-in-95"
                  style={{ backgroundColor: DS.white }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Clean Header */}
                  <div className="px-5 pt-5 pb-3 border-b" style={{ borderColor: DS.border }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editForm.customer_name || ''}
                              onChange={e => setEditForm(prev => ({ ...prev, customer_name: e.target.value }))}
                              className="w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-all text-2xl font-black"
                              style={{ borderColor: DS.border, color: DS.ink, backgroundColor: DS.white }}
                              onFocus={(e) => e.currentTarget.style.borderColor = DS.electric}
                              onBlur={(e) => e.currentTarget.style.borderColor = DS.border}
                              placeholder="Customer Name"
                            />
                            <input
                              type="text"
                              value={editForm.title || ''}
                              onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none transition-all text-sm font-bold"
                              style={{ borderColor: DS.border, color: DS.stone, backgroundColor: DS.white }}
                              onFocus={(e) => e.currentTarget.style.borderColor = DS.electric}
                              onBlur={(e) => e.currentTarget.style.borderColor = DS.border}
                              placeholder="Appointment Type"
                            />
                          </div>
                        ) : (
                          <div>
                            <h2 className="text-2xl font-black leading-tight mb-1" style={{ color: DS.ink }}>
                              {selectedApptData.customer_name}
                            </h2>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase" style={{ 
                                backgroundColor: DS.electricLight, 
                                color: DS.electric 
                              }}>
                                {selectedApptData.title || selectedApptData.type || 'Consultation'}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase border" style={{ 
                                backgroundColor: DS.white, 
                                color: DS.stone,
                                borderColor: DS.border
                              }}>
                                {selectedApptData.status}
                              </span>
                              {isNightAppointment(selectedApptData) && (
                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1" style={{ 
                                  backgroundColor: '#EEF2FF', 
                                  color: '#6366F1' 
                                }}>
                                  <Moon size={10} />
                                  Night
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleCloseModal}
                        className="p-2 rounded-xl transition-all duration-300 active:scale-90 group ml-4"
                        style={{ 
                          backgroundColor: DS.offWhite,
                          color: DS.stone
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = DS.border;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = DS.offWhite;
                        }}
                      >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Body - Clean Card Layout */}
                  <div className="p-5 space-y-3" style={{ backgroundColor: DS.white }}>
                    
                    {/* Schedule Card - Compact Design */}
                    <div className="bg-white border rounded-2xl p-4 transition-all hover:shadow-md" style={{ borderColor: DS.border }}>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl flex-shrink-0" style={{ backgroundColor: DS.electricLight }}>
                          <Clock className="w-5 h-5" style={{ color: DS.electric }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <p className="text-base font-black leading-tight" style={{ color: DS.ink }}>
                                {format(getZonedTime(selectedApptData.start_time), 'EEEE')}
                              </p>
                              <p className="text-xs font-bold" style={{ color: DS.stone }}>
                                {format(getZonedTime(selectedApptData.start_time), 'MMMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: DS.electricLight, color: DS.electric }}>
                              {formatTime(getZonedTime(selectedApptData.start_time))}
                            </span>
                            <span style={{ color: DS.subtleText, fontSize: '10px' }}>→</span>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: DS.electricLight, color: DS.electric }}>
                              {formatTime(getZonedTime(selectedApptData.end_time))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Location & Contact - Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Location Card */}
                      <div className="bg-white border rounded-2xl p-4 transition-all hover:shadow-md" style={{ borderColor: DS.border }}>
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: DS.offWhite }}>
                            <MapPin className="w-4 h-4" style={{ color: DS.stone }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: DS.stone }}>Location</h3>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.location || ''}
                                onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                                className="w-full border-2 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none transition-all"
                                style={{ borderColor: DS.border, color: DS.ink, backgroundColor: DS.white }}
                                onFocus={(e) => e.currentTarget.style.borderColor = DS.electric}
                                onBlur={(e) => e.currentTarget.style.borderColor = DS.border}
                                placeholder="Add location..."
                              />
                            ) : (
                              <div>
                                <p className="text-sm font-bold leading-tight" style={{ color: DS.ink }}>
                                  {selectedApptData.location ? 'Physical' : 'Virtual'}
                                </p>
                                <p className="text-xs font-medium mt-0.5" style={{ color: DS.stone }}>
                                  {selectedApptData.location || 'Online / Remote'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact Card */}
                      <div className="bg-white border rounded-2xl p-4 transition-all hover:shadow-md" style={{ borderColor: DS.border }}>
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: '#ECFDF5' }}>
                            <Phone className="w-4 h-4" style={{ color: '#059669' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: DS.stone }}>Contact</h3>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.phone || ''}
                                onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full border-2 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none transition-all"
                                style={{ borderColor: DS.border, color: DS.ink, backgroundColor: DS.white }}
                                onFocus={(e) => e.currentTarget.style.borderColor = DS.electric}
                                onBlur={(e) => e.currentTarget.style.borderColor = DS.border}
                                placeholder="Add phone..."
                              />
                            ) : (
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-bold leading-tight" style={{ color: DS.ink }}>
                                  {selectedApptData.phone || 'No phone'}
                                </p>
                                {selectedApptData.phone && (
                                  <a 
                                    href={`tel:${selectedApptData.phone}`} 
                                    className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                                    style={{ backgroundColor: DS.electricLight }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DS.electric}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = DS.electricLight}
                                  >
                                    <Phone className="w-3 h-3" style={{ color: DS.electric }} />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes Card - Full Width */}
                    <div className="bg-white border rounded-2xl p-4 transition-all hover:shadow-md" style={{ borderColor: DS.border }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: '#FFFBEB' }}>
                          <FileText className="w-4 h-4" style={{ color: '#D97706' }} />
                        </div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: DS.stone }}>Notes</h3>
                      </div>
                      {isEditing ? (
                        <textarea
                          value={editForm.notes || ''}
                          onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full border-2 rounded-xl px-3 py-2 min-h-[80px] text-sm font-medium focus:outline-none resize-none transition-all"
                          style={{ borderColor: DS.border, color: DS.ink, backgroundColor: DS.white }}
                          onFocus={(e) => e.currentTarget.style.borderColor = DS.electric}
                          onBlur={(e) => e.currentTarget.style.borderColor = DS.border}
                          placeholder="Add appointment notes..."
                        />
                      ) : (
                        <div className="rounded-xl p-3" style={{ backgroundColor: DS.surface }}>
                          <p className="text-xs leading-relaxed font-medium" style={{ color: DS.charcoal }}>
                            {selectedApptData.notes || 'No additional notes provided.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="px-5 py-4 border-t flex gap-3" style={{ borderColor: DS.border, backgroundColor: DS.white }}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex-1 px-4 py-2.5 font-bold border-2 rounded-xl active:scale-95 transition-all text-sm"
                          style={{ color: DS.stone, backgroundColor: DS.white, borderColor: DS.border }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DS.offWhite}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = DS.white}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="flex-[1.5] px-4 py-2.5 font-bold text-white rounded-xl active:scale-95 transition-all text-sm shadow-md"
                          style={{ backgroundColor: DS.electric }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DS.electricDark}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = DS.electric}
                        >
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleStartEdit}
                          className="flex-1 px-4 py-2.5 font-bold border-2 rounded-xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                          style={{ color: DS.electric, backgroundColor: DS.white, borderColor: DS.electric }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = DS.electricLight;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = DS.white;
                          }}
                        >
                          <Layers size={16} />
                          Edit
                        </button>
                        <button
                          onClick={handleCloseModal}
                          className="flex-1 px-4 py-2.5 font-bold text-white rounded-xl active:scale-95 transition-all text-sm shadow-md"
                          style={{ backgroundColor: DS.ink }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DS.charcoal}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = DS.ink}
                        >
                          Close
                        </button>
                      </>
                    )}
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
                  style={{ backgroundColor: DS.white, border: '1px solid #E5E7EB', color: DS.ink }}
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
                  style={{ backgroundColor: DS.white, border: '1px solid #E5E7EB', color: DS.ink }}
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
                  style={{ backgroundColor: DS.white, border: '1px solid #E5E7EB', color: DS.ink }}
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
                  style={{ backgroundColor: DS.white, border: '1px solid #E5E7EB', color: DS.ink }}
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
      </div>
    </DashboardLayout>
  );
};

export default FullScreenAppointments;