import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from 'react-simple-pull-to-refresh';
import {
  LayoutDashboard,
  HelpCircle,
  Settings,
  ChevronRight,
  LogOut,
  Bell,
  Menu,
  X,
  PhoneCall,
  Calendar,
  Building2,
  Search,
  Zap,
  Layers,
  CreditCard,
  Command,
  Star
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useSearch } from '../../hooks/useSearch';
import { billingApi } from '../../api/billing';
import NotificationPanel from '../../components/dashboard/NotificationPanel';
import ProfileDropdown from '../../components/dashboard/ProfileDropdown';
import { NavigationGuard } from '../../utils/navigationGuard';
import { PullToRefresh } from '../../components/layout/PullToRefresh';

import { env } from '../../config/env';
import { getAuthHeader } from '../../lib/api';

// --- DESIGN SYSTEM COLORS ---
const DS = {
  // 60% White / Grayscale
  white: '#FFFFFF',
  surface: '#FAFBFC',
  offWhite: '#F5F7FA',
  border: '#E5E7EB', // Derived from #F5F7FA for contrast

  // 30% Charcoal / Slate
  ink: '#1F2937',
  charcoal: '#374151',
  stone: '#4B5563',
  subtleText: '#9CA3AF',

  // 10% Electric Blue
  electric: '#3B82F6',
  electricDark: '#2563EB', // Hover state
  electricLight: '#EFF6FF', // Background tint
  electricTint: 'rgba(59, 130, 246, 0.1)'
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  secondaryNav?: React.ReactNode;
}

interface BusinessProfile {
  id: string;
  business_name: string;
  business_type?: string;
  phone_number?: string;
}

// --- UI COMPONENTS ---

const SectionLabel = ({ label, sidebarOpen }: { label: string; sidebarOpen: boolean }) => (
  <h3 className={`px-6 mt-8 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`} style={{ color: DS.stone }}>
    {label}
  </h3>
);

const NavItem = ({
  item,
  isCollapsed = false,
  isActive,
  onClick
}: {
  item: { path: string; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string };
  isCollapsed?: boolean;
  isActive: boolean;
  onClick?: () => void;
}) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={`group relative flex items-center ${isCollapsed ? 'justify-center px-3' : 'justify-between px-5'} py-3 mx-2 rounded-xl text-sm font-bold transition-all duration-300
        ${isActive
          ? 'text-blue-600 bg-blue-50 ring-1 ring-blue-100 shadow-sm' // Using DS Electric & Tint
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }`}
      onClick={onClick}
      title={isCollapsed ? item.label : undefined}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-600 rounded-r-full" />
      )}

      <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <Icon size={18} strokeWidth={2.5} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700 transition-colors'} />
        {!isCollapsed && <span className="transition-colors">{item.label}</span>}
      </div>
      {!isCollapsed && item.badge && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${isActive ? 'bg-blue-200 text-blue-800' : item.badgeColor || 'bg-blue-100 text-blue-700'}`}>
          {item.badge}
        </span>
      )}
    </Link>
  );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  fullWidth = false,
  secondaryNav
}) => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { notifications, unreadCount, dismissNotification } = useNotifications();
  const { searchQuery, setSearchQuery, setIsSearchFocused, clearSearch } = useSearch();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
  };

  // Sync local state with context when context changes (e.g. clear search)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce updates to context
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        setSearchQuery(localSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery, searchQuery]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const { data: businessProfile } = useQuery<BusinessProfile | null>({
    queryKey: ['business-profile', user?.id],
    queryFn: async ({ signal }) => {
      if (!user?.id) return null;

      const headers = await getAuthHeader();
      const response = await fetch(`${env.API_URL}/profile`, {
        headers,
        signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data) return null;

      return {
        id: user.id,
        business_name: data.business_name || 'My Business',
        business_type: data.business_type,
        phone_number: data.contact_phone || data.phone
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 15,
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: () => billingApi.getSubscription(),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userEmail = user?.email || '';
  const displayName = businessProfile?.business_name || user?.full_name || userEmail.split('@')[0] || 'User';
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      <NavigationGuard isAuthenticated={!!user} />
      {/* Main Container - Using DS OffWhite for background */}
      <div className="h-screen h-[100dvh] flex font-sans overflow-hidden" style={{ backgroundColor: DS.offWhite }}>

        {/* SIDEBAR - Using DS White for surface */}
        <aside
          className={`hidden md:flex flex-col h-full transition-all duration-300 ease-in-out border-r`}
          style={{
            width: sidebarOpen ? '288px' : '80px',
            backgroundColor: DS.white,
            borderColor: DS.border
          }}
        >

          {/* Logo Header */}
          <div className={`h-20 flex items-center border-b transition-all duration-300 ${sidebarOpen ? 'justify-between px-8' : 'justify-center px-4'}`} style={{ borderColor: DS.border }}>
            <div className={`flex items-center transition-all duration-300 ${sidebarOpen ? 'px-6' : 'justify-center w-full px-4'}`}>
              <button
                onClick={() => !sidebarOpen && setSidebarOpen(true)}
                className={`flex items-center justify-center flex-shrink-0 group ${!sidebarOpen ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="VocalScale" width="428" height="428" className="w-10 h-10 object-contain" />
                  {sidebarOpen && (
                    <span className="text-xl font-black tracking-tight text-slate-900">VocalScale</span>
                  )}
                </div>
              </button>
            </div>

            {/* Toggle Button (Only visible when open) */}
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Collapse sidebar"
                style={{ color: DS.stone }}
              >
                <ChevronRight size={16} className="transform rotate-180" strokeWidth={3} />
              </button>
            )}
          </div>

          {/* Scrollable Nav Area */}
          <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden scrollbar-hide">

            <SectionLabel label="General" sidebarOpen={sidebarOpen} />
            <NavItem
              item={{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard')}
            />

            <SectionLabel label="Operations" sidebarOpen={sidebarOpen} />
            <NavItem
              item={{ path: '/dashboard/appointments', label: 'Appointments', icon: Calendar }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/appointments')}
            />
            <NavItem
              item={{ path: '/dashboard/calls', label: 'Call Logs', icon: PhoneCall }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/calls')}
            />
            <NavItem
              item={{ path: '/dashboard/reviews', label: 'Reviews', icon: Star }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/reviews')}
            />

            <SectionLabel label="Configuration" sidebarOpen={sidebarOpen} />
            <NavItem
              item={{ path: '/dashboard/business-details', label: 'Business Profile', icon: Building2 }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/business-details')}
            />
            <NavItem
              item={{ path: '/dashboard/voice-setup', label: 'Voice Setup', icon: Layers }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/voice-setup')}
            />

            <div className="mt-auto">
              {/* Sidebar Header for Desktop Only */}
              <div className="hidden lg:block pt-6 border-t mt-6" style={{ borderColor: DS.border }}>
                <SectionLabel label="System" sidebarOpen={sidebarOpen} />
                <NavItem
                  item={{ path: '/dashboard/settings', label: 'Settings', icon: Settings }}
                  isCollapsed={!sidebarOpen}
                  isActive={isActive('/dashboard/settings')}
                />
                <NavItem
                  item={{ path: '/dashboard/billing', label: 'Billing', icon: CreditCard }}
                  isCollapsed={!sidebarOpen}
                  isActive={isActive('/dashboard/billing')}
                />
                <NavItem
                  item={{ path: '/dashboard/help', label: 'Help & Docs', icon: HelpCircle }}
                  isCollapsed={!sidebarOpen}
                  isActive={isActive('/dashboard/help')}
                />
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-5' : 'justify-center'} py-3 text-sm font-bold rounded-xl transition-all duration-300 group`}
                style={{ color: DS.stone }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FEF2F2'; // Very subtle red
                  e.currentTarget.style.color = '#DC2626'; // Red
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = DS.stone;
                }}
              >
                <LogOut size={18} strokeWidth={2.5} className={sidebarOpen ? 'mr-3 group-hover:-translate-x-1 transition-transform' : ''} />
                {sidebarOpen && <span>Log Out</span>}
              </button>
            </div>
          </div>

          {/* Bottom Card & Upgrade */}
          <div className="p-3 border-t space-y-2" style={{ borderColor: DS.border, backgroundColor: DS.surface }}>
            {/* Promo Card / Plan Badge */}
            {sidebarOpen && (
              <div className={`relative overflow-hidden rounded-xl p-3 shadow-sm border transition-all duration-500 group hover:shadow-lg ${subscription?.plans?.name
                ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-800'
                : 'bg-white border-slate-100 hover:border-blue-200'
                }`}>
                {/* Decorative background element */}
                <div className="absolute -right-3 -top-3 w-12 h-12 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-700" />

                <div className="flex items-center gap-2 mb-1.5 relative z-10">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${subscription?.plans?.name
                    ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                    : 'bg-blue-50 text-blue-600'
                    }`}>
                    <Zap size={12} strokeWidth={2.5} />
                  </div>
                  <h4 className={`text-[10px] font-black uppercase tracking-widest ${subscription?.plans?.name ? 'text-white' : 'text-slate-900'
                    }`}>
                    {subscription?.plans?.name ? subscription.plans.name : 'Upgrade'}
                  </h4>
                </div>

                {subscription?.plans?.name ? (
                  <div className="flex flex-col gap-2 relative z-10">
                    <p className="text-[9px] leading-tight font-medium text-slate-400">
                      Premium features <span className="text-blue-400">active</span>.
                    </p>
                    <Link
                      to="/dashboard/billing"
                      className="w-full py-1.5 flex items-center justify-center bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-all shadow-md shadow-blue-900/20 group/btn"
                    >
                      Billing
                      <ChevronRight size={10} className="ml-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <p className="text-[9px] leading-tight mb-2 font-medium text-slate-500">Unlock unlimited AI minutes & models.</p>
                    <Link
                      to="/dashboard/billing/plans"
                      className="w-full py-1.5 flex items-center justify-center bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                    >
                      View Plans
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

        </aside>

        {/* MAIN CONTENT WRAPPER */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

          {/* TOP NAVIGATION BAR */}
          <header className="h-20 backdrop-blur-xl border-b shrink-0 z-30 px-2 md:px-10 flex items-center justify-between transition-all duration-300" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', borderColor: DS.border }}>

            {/* Mobile Menu Toggle - Always visible on mobile, positioned at start */}
            <button
              className="md:hidden p-2.5 rounded-xl flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              style={{ color: DS.charcoal, backgroundColor: DS.white }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Top Logo - Mobile Only */}
            <div className="md:hidden flex items-center gap-2 mr-2">
              <img src="/logo.png" alt="VocalScale" width="428" height="428" className="w-8 h-8 object-contain" />
            </div>

            {/* Left: Search (Always visible now, responsive width) */}
            <div className="flex-1 max-w-2xl flex items-center">
              <div className="relative w-full group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <Search size={18} strokeWidth={2.5} style={{ color: DS.subtleText }} className="group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  role="searchbox"
                  aria-label="Search dashboard"
                  placeholder="Search logs, appointments..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onFocus={(e) => {
                    setIsSearchFocused(true);
                    e.target.style.borderColor = DS.electric;
                    e.target.style.boxShadow = `0 0 0 3px ${DS.electricTint}`;
                  }}
                  onBlur={(e) => {
                    setIsSearchFocused(false);
                    e.target.style.borderColor = DS.border;
                    e.target.style.boxShadow = 'none';
                  }}
                  className="w-full pl-11 pr-12 py-2.5 border rounded-xl text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: DS.white,
                    borderColor: DS.border,
                    color: DS.ink
                  }}
                />
                {/* Keyboard shortcut hint */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded transition-opacity pointer-events-none border" style={{ backgroundColor: DS.surface, color: DS.stone, borderColor: DS.border }}>
                  <Command size={10} />
                  <span>K</span>
                </div>
                {/* Clear button */}
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
                    aria-label="Clear search"
                    style={{ color: DS.subtleText }}
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>

            {/* Secondary Nav / Filters Slot */}
            {secondaryNav && (
              <div className="hidden lg:flex items-center flex-1 px-8 max-w-2xl">
                {secondaryNav}
              </div>
            )}

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-2 md:gap-4 ml-4">

              {/* Icon Actions */}
              <div className="flex items-center gap-1 border-r pr-2 md:pr-4" style={{ borderColor: DS.border }}>
                <Link
                  to="/dashboard/billing"
                  className={`hidden sm:flex items-center justify-center p-2.5 rounded-xl transition-all relative group border border-transparent hover:bg-slate-50 ${isActive('/dashboard/billing') ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-slate-500 hover:border-slate-200'}`}
                  aria-label="Billing"
                >
                  <CreditCard size={20} strokeWidth={isActive('/dashboard/billing') ? 2.5 : 2} />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                    aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                    className={`p-2.5 rounded-xl transition-all relative outline-none group ${notificationPanelOpen
                      ? 'bg-blue-50 text-blue-600' // Electric Light/Dark
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                      }`}
                  >
                    <Bell size={20} strokeWidth={2.5} />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                      </span>
                    )}
                  </button>
                  <NotificationPanel
                    isOpen={notificationPanelOpen}
                    onClose={() => setNotificationPanelOpen(false)}
                    notifications={notifications}
                    onDismiss={dismissNotification}
                  />
                </div>
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-haspopup="true"
                  aria-expanded={profileDropdownOpen}
                  className={`flex items-center gap-3 p-1 pl-3 rounded-full transition-all duration-200 ${profileDropdownOpen
                    ? 'bg-slate-100 ring-2 ring-slate-100'
                    : 'bg-transparent hover:bg-slate-50'
                    }`}
                >
                  <span className="hidden lg:block text-xs font-bold text-slate-700">{displayName}</span>

                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-white">
                    {firstLetter}
                  </div>
                </button>
                <ProfileDropdown
                  isOpen={profileDropdownOpen}
                  onClose={() => setProfileDropdownOpen(false)}
                  onSignOut={handleSignOut}
                  displayName={displayName}
                  email={userEmail}
                  avatarUrl={user?.avatar_url}
                />
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main
            className={`flex-1 ${fullWidth ? 'p-0 overflow-hidden' : 'p-4 md:p-8 overflow-y-auto'}`}
            style={{ backgroundColor: DS.offWhite }}
            onDoubleClick={() => {
              if (sidebarOpen) setSidebarOpen(false);
            }}
          >
            <PullToRefresh
              onRefresh={handleRefresh}
              pullingContent=""
              refreshingContent={
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              }
            >
              <div>{children}</div>
            </PullToRefresh>
          </main>
        </div>

        {/* MOBILE MENU OVERLAY */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden backdrop-blur-sm animate-in fade-in duration-200" style={{ backgroundColor: 'rgba(31, 41, 55, 0.4)' }} onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-300" style={{ backgroundColor: DS.white }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="VocalScale" width="428" height="428" className="w-10 h-10 object-contain" />
                    <span className="text-2xl font-black tracking-tight text-slate-900">VocalScale</span>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl" aria-label="Close menu" style={{ color: DS.stone, backgroundColor: DS.surface }}>
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                <div>
                  <SectionLabel label="General" sidebarOpen={true} />
                  <NavItem
                    item={{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }}
                    isActive={isActive('/dashboard')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                </div>

                <div>
                  <SectionLabel label="Operations" sidebarOpen={true} />
                  <NavItem
                    item={{ path: '/dashboard/appointments', label: 'Appointments', icon: Calendar }}
                    isActive={isActive('/dashboard/appointments')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <NavItem
                    item={{ path: '/dashboard/calls', label: 'Call Logs', icon: PhoneCall }}
                    isActive={isActive('/dashboard/calls')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <NavItem
                    item={{ path: '/dashboard/reviews', label: 'Reviews', icon: Star }}
                    isActive={isActive('/dashboard/reviews')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                </div>

                <div>
                  <SectionLabel label="Configuration" sidebarOpen={true} />
                  <NavItem
                    item={{ path: '/dashboard/business-details', label: 'Business Profile', icon: Building2 }}
                    isActive={isActive('/dashboard/business-details')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <NavItem
                    item={{ path: '/dashboard/voice-setup', label: 'Voice Setup', icon: Layers }}
                    isActive={isActive('/dashboard/voice-setup')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                </div>

                <div className="pt-6 border-t mt-6" style={{ borderColor: DS.border }}>
                  <SectionLabel label="System" sidebarOpen={true} />
                  <NavItem
                    item={{ path: '/dashboard/settings', label: 'Settings', icon: Settings }}
                    isActive={isActive('/dashboard/settings')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <NavItem
                    item={{ path: '/dashboard/billing', label: 'Billing', icon: CreditCard }}
                    isActive={isActive('/dashboard/billing')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <NavItem
                    item={{ path: '/dashboard/help', label: 'Help & Docs', icon: HelpCircle }}
                    isActive={isActive('/dashboard/help')}
                    onClick={() => setMobileMenuOpen(false)}
                  />

                  {/* Sign Out Button */}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-start px-5 py-3 mx-2 text-sm font-bold rounded-xl transition-colors group mt-4"
                    style={{ color: DS.stone }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEF2F2';
                      e.currentTarget.style.color = '#DC2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = DS.stone;
                    }}
                  >
                    <LogOut size={18} strokeWidth={2.5} className="mr-3 group-hover:translate-x-1 transition-transform" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardLayout;