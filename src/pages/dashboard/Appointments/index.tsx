import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppointments, type Appointment } from '../../../hooks/useAppointments';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useSearch } from '../../../hooks/useSearch';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import { 
  format, addDays, startOfWeek, isSameDay, 
  getHours, getMinutes, setHours, setMinutes, addMinutes,
  isToday as isDateToday
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Plus, Clock, Moon, Sun, 
  X, Layers, FileText, Globe, GripVertical, MapPin, Phone,
  Calendar as CalendarIcon
} from 'lucide-react';

import { 
  toZonedTime 
} from 'date-fns-tz';

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
type ViewDensity = 'compact' | 'comfortable' | 'spacious';

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
    setViewMode(isMobile ? 'day' : 'week');
  }, [isMobile]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Appointment>>({});
  const [density] = useState<ViewDensity>('compact');
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
  const START_HOUR = show24Hours ? 0 : 6;
  const END_HOUR = show24Hours ? 24 : 22;
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

  // Check if appointment is in night hours (before 6 AM or after 10 PM)
  const isNightAppointment = useCallback((appt: Appointment): boolean => {
    const hour = getHours(getZonedTime(appt.start_time));
    return hour < 6 || hour >= 22;
  }, [getZonedTime]);

  const nightAppointmentsCount = useMemo(() => {
    return appointments.filter(isNightAppointment).length;
  }, [appointments, isNightAppointment]);

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
    const totalColumns = sortedGroup.length;
    
    // Calculate width and position with gaps
    const gap = 2; // pixels
    const availableWidth = 100;
    const columnWidth = availableWidth / totalColumns;
    const left = columnIndex * columnWidth;
    
    return {
      top: `${Math.max(0, top)}%`,
      height: `${Math.max(2, height)}%`,
      left: `calc(${left}% + ${gap}px)`,
      width: `calc(${columnWidth}% - ${gap * 2}px)`,
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
    ghost.className = 'bg-blue-600 text-white px-3 py-2 rounded-lg shadow-xl text-sm font-medium';
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
        bg: 'bg-gray-400',
        hover: 'hover:bg-gray-500',
        border: 'border-gray-500',
        text: 'text-white',
        dot: 'bg-gray-500'
      };
    }
    
    // Status-based colors
    if (appt.status === 'Pending') {
      return {
        bg: isNight ? 'bg-amber-600' : 'bg-amber-500',
        hover: 'hover:bg-amber-600',
        border: 'border-amber-700',
        text: 'text-white',
        dot: 'bg-amber-500'
      };
    }
    
    if (appt.status === 'Scheduled' || appt.status === 'Confirmed') {
      return {
        bg: isNight ? 'bg-indigo-700' : 'bg-indigo-600',
        hover: 'hover:bg-indigo-700',
        border: 'border-indigo-800',
        text: 'text-white',
        dot: 'bg-indigo-600'
      };
    }

    // Type-based fallback colors
    if (appt.type === 'Strategy') {
      return {
        bg: isNight ? 'bg-purple-700' : 'bg-purple-500',
        hover: 'hover:bg-purple-600',
        border: 'border-purple-600',
        text: 'text-white',
        dot: 'bg-purple-500'
      };
    }
    if (appt.type === 'Consultation') {
      return {
        bg: isNight ? 'bg-emerald-700' : 'bg-emerald-500',
        hover: 'hover:bg-emerald-600',
        border: 'border-emerald-600',
        text: 'text-white',
        dot: 'bg-emerald-500'
      };
    }
    
    // Default fallback
    return {
      bg: isNight ? 'bg-blue-700' : 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      border: 'border-blue-800',
      text: 'text-white',
      dot: 'bg-blue-600'
    };
  };

  // Height based on density
  const getRowHeight = () => {
    if (isMobile) return 'h-20'; // Even taller on mobile for better touch targets
    switch (density) {
      case 'compact': return 'h-8';
      case 'comfortable': return 'h-12';
      case 'spacious': return 'h-16';
    }
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
        <div className="h-full bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-600 font-medium">Loading appointments...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout fullWidth>
        <div className="h-full bg-white flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to load appointments</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="h-full flex flex-col overflow-hidden">
      
        {/* ============ HEADER ============ */}
      <header className="flex-shrink-0 border-b border-gray-200 bg-white px-3 py-2 md:px-4 md:py-3 flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-stretch md:items-center">
        <div className="flex items-center justify-between w-full md:w-auto">
          
          {/* Left: Title (Logo Removed) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl md:hidden">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="hidden md:inline">Appointments</span>
                  <span className="md:hidden">Schedule</span>
                  {isPlaceholderData && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full animate-pulse">
                      <Clock size={10} className="animate-spin-slow" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Syncing...</span>
                    </div>
                  )}
                </h1>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium">
                  {viewMode === 'day' ? format(currentDate, 'EEE, MMM d') : format(currentDate, 'MMMM yyyy')}
                </p>
              </div>
            </div>

            {/* Quick Stats - Desktop Only */}
            <div className="hidden lg:flex items-center gap-2 ml-6 pl-6 border-l border-gray-200">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-gray-600">Today:</span>
                <span className="text-sm font-bold text-gray-900">{todayAppts.length}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-medium text-gray-600">Pending:</span>
                <span className="text-sm font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'Pending').length}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Add New - Visible only on small screens next to title */}
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="md:hidden flex items-center justify-center w-10 h-10 bg-blue-600 active:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-600/25 active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Center/Right: Controls Wrapper */}
        <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          {/* View Toggle (Day/Week) */}
          <div className="flex bg-gray-100 p-1 rounded-xl self-stretch sm:self-center md:self-auto">
            <button
              onClick={() => setViewMode('day')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Week
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 justify-between sm:justify-start">
            <button 
              onClick={() => setCurrentDate(toZonedTime(new Date(), timezone))}
              className="flex-1 sm:flex-none px-4 py-2 text-xs md:text-sm font-bold text-gray-700 bg-gray-100 active:bg-gray-200 rounded-xl transition-all active:scale-95"
            >
              Today
            </button>
            <div className="flex items-center bg-gray-100 rounded-xl">
              <button 
                onClick={() => setCurrentDate(d => addDays(d, viewMode === 'day' ? -1 : -7))} 
                className="p-2 hover:bg-gray-200 active:bg-gray-300 rounded-l-xl transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="px-2 md:px-3 text-xs md:text-sm font-bold text-gray-900 min-w-[100px] sm:min-w-[140px] md:min-w-[180px] text-center">
                {viewMode === 'day' 
                  ? format(currentDate, 'MMM d') 
                  : `${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d')}`
                }
              </span>
              <button 
                onClick={() => setCurrentDate(d => addDays(d, viewMode === 'day' ? 1 : 7))} 
                className="p-2 hover:bg-gray-200 active:bg-gray-300 rounded-r-xl transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Right: Controls - Horizontal Scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            
            {/* 24-Hour Toggle */}
            <button
              onClick={() => setShow24Hours(!show24Hours)}
              className={`flex-shrink-0 flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl transition-colors ${
                show24Hours 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              {show24Hours ? <Moon className="w-4 h-4 md:w-5 md:h-5" /> : <Sun className="w-4 h-4 md:w-5 md:h-5" />}
            </button>

            {/* Time Format Toggle */}
            <button
              onClick={() => setTimeFormat(f => f === '12h' ? '24h' : '12h')}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-gray-100 active:bg-gray-200 rounded-xl text-gray-600 transition-colors"
            >
              <Clock className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Weekend Toggle - Hidden in Day view */}
            {viewMode === 'week' && (
              <button
                onClick={() => setShowWeekend(!showWeekend)}
                className={`flex-shrink-0 flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl transition-colors ${
                  showWeekend 
                    ? 'bg-gray-100 text-gray-600 active:bg-gray-200' 
                    : 'bg-orange-100 text-orange-700 border border-orange-200'
                }`}
              >
                <Layers className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}

            {/* Add New - Desktop Only */}
            <button 
              onClick={() => setIsNewModalOpen(true)}
              className="hidden md:flex flex-shrink-0 items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-600/25 active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

        {/* ============ CALENDAR GRID ============ */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Days Header */}
        <div
          className="flex-shrink-0 grid border-b-2 border-gray-200 bg-gray-50"
          style={{ gridTemplateColumns: `${isMobile ? '50px' : '60px'} repeat(${weekDays.length}, 1fr)` }}
        >
          <div className="border-r border-gray-200 flex items-center justify-center py-2">
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const dayAppts = getDayAppointments(day);
            const hasNightAppts = dayAppts.some(isNightAppointment);
            
            return (
              <div
                key={i}
                className={`flex flex-col items-center justify-center py-2 border-r border-gray-200 transition-colors ${
                  isToday ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    isToday ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {format(day, 'EEE')}
                  </span>
                  {hasNightAppts && !show24Hours && (
                    <Moon className="w-3 h-3 text-indigo-400" />
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-lg font-bold ${
                    isToday 
                      ? 'text-white bg-blue-600 w-8 h-8 flex items-center justify-center rounded-full' 
                      : 'text-gray-900'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayAppts.length > 0 && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      isToday ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {dayAppts.length}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid - Scrollable */}
        <div 
          className="flex-1 grid overflow-y-auto scroll-smooth pb-20 md:pb-0"
          style={{ gridTemplateColumns: `${isMobile ? '50px' : '60px'} repeat(${weekDays.length}, 1fr)` }}
        >
          
          {/* Time Column */}
          <div className="border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
            {hours.map((hour) => {
              const isNightHour = hour < 6 || hour >= 22;
              return (
                <div 
                  key={hour} 
                  className={`${getRowHeight()} flex items-start justify-end pr-2 pt-2 border-b border-gray-100 ${
                    isNightHour ? 'bg-indigo-50/50' : ''
                  }`}
                >
                  <span className={`text-[10px] font-semibold ${
                    isNightHour ? 'text-indigo-400' : 'text-gray-400'
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
                className={`border-r border-gray-200 relative ${
                  isToday ? 'bg-blue-50/20' : ''
                }`}
              >
                {/* Hour Rows */}
                {hours.map((hour) => {
                  const isNightHour = hour < 6 || hour >= 22;
                  const isDropTarget = dragState.currentDropTarget?.day && 
                    isSameDay(dragState.currentDropTarget.day, day) && 
                    dragState.currentDropTarget.hour === hour;
                  
                  return (
                    <div 
                      key={hour}
                      className={`${getRowHeight()} border-b border-gray-100 transition-colors ${
                        isNightHour ? 'bg-indigo-50/30' : ''
                      } ${isDropTarget ? 'bg-blue-100 border-blue-300' : ''} ${
                        dragState.isDragging ? 'cursor-copy' : ''
                      }`}
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
                        <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 ring-2 ring-white shadow-lg animate-pulse" />
                        <div className="h-0.5 bg-red-500 flex-1" />
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
                        rounded-lg shadow-sm cursor-grab active:cursor-grabbing 
                        transition-all group overflow-hidden border-l-4 ${colors.border}
                        hover:shadow-lg hover:z-30
                        ${isSelected ? 'ring-2 ring-offset-1 ring-blue-400 z-40 scale-[1.02]' : 'z-20'}
                        ${isDragging ? 'opacity-40 scale-95' : ''}
                        ${appt.status === 'Canceled' ? 'opacity-50' : ''}`}
                      style={{
                        top: pos.top,
                        height: pos.height,
                        left: pos.left,
                        width: pos.width,
                        minHeight: '20px'
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
                        <div className="absolute top-1 right-1">
                          <Moon className="w-3 h-3 text-white/60" />
                        </div>
                      )}
                      
                      {/* Drag Handle */}
                      <div className="absolute top-0.5 left-0.5 opacity-0 group-hover:opacity-70 transition-opacity cursor-grab">
                        <GripVertical className="w-3 h-3" />
                      </div>
                      
                      {/* Partial visibility indicators */}
                      {pos.isBeforeVisible && (
                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/50 rounded-full" />
                      )}
                      {pos.isAfterVisible && (
                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/50 rounded-full" />
                      )}

                      <div className="px-2.5 py-2 h-full flex flex-col justify-start">
                        <p className={`font-semibold truncate leading-tight ${isMobile ? 'text-[13px]' : 'text-[11px]'}`}>
                          {appt.customer_name}
                        </p>
                        {pos.rawHeight > 5 && (
                          <p className={`opacity-80 mt-1 truncate ${isMobile ? 'text-[11px]' : 'text-[9px]'}`}>
                            {formatTime(getZonedTime(appt.start_time))}
                          </p>
                        )}
                        {pos.rawHeight > 8 && (
                          <p className={`opacity-70 truncate ${isMobile ? 'text-[11px]' : 'text-[9px]'}`}>
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
        </div>
      </div>

      {/* ============ APPOINTMENT DETAIL MODAL ============ */}
      {selectedAppointment && selectedApptData && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
            onClick={handleCloseModal}
          />
          <div 
            className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
              bg-white rounded-t-3xl md:rounded-2xl shadow-2xl border border-gray-200 z-[101] 
              w-full md:max-w-md overflow-hidden transition-transform animate-in slide-in-from-bottom duration-300 md:zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drawer Handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3 md:hidden" />

            {/* Header */}
            <div className={`p-5 ${getAppointmentColors(selectedApptData).bg} relative`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {isNightAppointment(selectedApptData) && (
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Moon className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-white/90 bg-white/20 px-3 py-1 rounded-full">
                    {selectedApptData.status}
                  </span>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/20 active:bg-white/30 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              
              {isEditing ? (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={editForm.customer_name || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, customer_name: e.target.value }))}
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 text-lg"
                    placeholder="Customer Name"
                  />
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40"
                    placeholder="Appointment Type"
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{selectedApptData.customer_name}</h2>
                  <p className="text-white/90 mt-1 font-medium">{selectedApptData.title}</p>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Date & Time Section */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</h3>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {format(getZonedTime(selectedApptData.start_time), 'EEEE, MMMM d')}
                  </p>
                  <p className="text-blue-600 font-bold">
                    {formatTime(getZonedTime(selectedApptData.start_time))} - {formatTime(getZonedTime(selectedApptData.end_time))}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</h3>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full mt-2 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-base font-bold text-gray-900 mt-1">{selectedApptData.location || 'Online / Remote'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</h3>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.phone || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full mt-2 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-base font-bold text-gray-900 mt-1">{selectedApptData.phone || 'No phone provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notes</h3>
                </div>
                {isEditing ? (
                  <textarea
                    value={editForm.notes || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full mt-2 border-2 border-gray-100 rounded-xl px-4 py-3 min-h-[100px] focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Add appointment notes..."
                  />
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-700 leading-relaxed italic">
                      {selectedApptData.notes || 'No additional notes for this appointment.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 flex gap-3 pb-8 md:pb-6">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-3 font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-6 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="flex-1 px-6 py-3 font-bold text-blue-600 bg-white border-2 border-blue-600 rounded-xl hover:bg-blue-50 active:scale-95 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 font-bold text-white bg-gray-900 rounded-xl hover:bg-black active:scale-95 transition-all"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ============ NEW APPOINTMENT MODAL ============ */}
      {isNewModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            onClick={() => setIsNewModalOpen(false)}
          />
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              bg-white rounded-2xl shadow-2xl border border-gray-200 z-[101] 
              w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-blue-600">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold text-white">New Appointment</h2>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={newAppointmentData.customer_name}
                  onChange={e => setNewAppointmentData(prev => ({ ...prev, customer_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newAppointmentData.start_time}
                  onChange={e => setNewAppointmentData(prev => ({ ...prev, start_time: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Type
                </label>
                <select
                  value={newAppointmentData.type}
                  onChange={e => setNewAppointmentData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Demo">Demo</option>
                  <option value="Review">Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Notes
                </label>
                <textarea
                  value={newAppointmentData.notes}
                  onChange={e => setNewAppointmentData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Add any notes..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  Create Appointment
                </button>
                <button 
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl font-medium border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ============ LEGEND ============ */}
      <footer className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-500 font-medium">Legend:</span>
            {[
              { color: 'bg-blue-500', label: 'Confirmed' },
              { color: 'bg-amber-500', label: 'Pending' },
              { color: 'bg-purple-500', label: 'Strategy' },
              { color: 'bg-emerald-500', label: 'Consultation' },
              { color: 'bg-gray-400', label: 'Canceled' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${item.color}`} />
                <span className="text-gray-600">{item.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-300">
              <Moon className="w-3 h-3 text-indigo-400" />
              <span className="text-gray-600">Night Appointment</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Drag appointments to reschedule • Click to view details
          </div>
        </div>
      </footer>
      </div>
    </DashboardLayout>
  );
};

export default FullScreenAppointments;