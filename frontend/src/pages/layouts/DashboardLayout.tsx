import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Star,
  Brain,
  Package // Added Package icon
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useSearch } from '../../hooks/useSearch';
import { billingApi } from '../../api/billing';
import NotificationPanel from '../../components/dashboard/NotificationPanel';
import ProfileDropdown from '../../components/dashboard/ProfileDropdown';
import { NavigationGuard } from '../../utils/navigationGuard';
import { cn } from '../../lib/utils';
import { PAGE_PADDING } from '../../constants/layout';
// FloatingChat removed


// --- DESIGN SYSTEM COLORS (Legacy constants for reference) ---
// Note: These are now mapped to CSS variables in index.css
const DS = {
  // 60% White / Grayscale
  white: 'var(--ds-white)',
  surface: 'var(--ds-surface)',
  offWhite: 'var(--ds-off-white)',
  border: 'var(--ds-border)',

  // 30% Charcoal / Slate
  ink: 'var(--ds-ink)',
  charcoal: 'var(--ds-charcoal)',
  stone: 'var(--ds-stone)',
  subtleText: 'var(--ds-subtle-text)',

  // 10% Electric Blue
  electric: 'var(--ds-electric)',
  electricDark: 'var(--ds-electric-dark)',
  electricLight: 'var(--ds-electric-light)',
  electricTint: 'var(--ds-electric-tint)'
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  secondaryNav?: React.ReactNode;
}

// --- UI COMPONENTS ---

// --- UI COMPONENTS ---

const SectionLabel = ({ label, sidebarOpen }: { label: string; sidebarOpen: boolean }) => (
  <h3 className={cn(
    "px-6 mt-8 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 text-[hsl(var(--ds-stone))]",
    sidebarOpen ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
  )}>
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
      className={`group relative flex items-center ${isCollapsed ? 'justify-center px-3' : 'justify-between px-5'} py-3 mx-2 rounded-xl text-sm font-bold transition-all duration-300 no-underline
        ${isActive
          ? 'text-blue-600 bg-blue-50 ring-1 ring-blue-100 shadow-sm' // Using DS Electric & Tint
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        } `}
      onClick={onClick}
      title={isCollapsed ? item.label : undefined}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-600 rounded-r-full" />
      )}

      <div className={`flex items-center gap-4 ${isCollapsed ? 'justify-center' : ''} `}>
        <Icon size={18} strokeWidth={2.5} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700 transition-colors'} />
        {!isCollapsed && <span className="transition-colors leading-relaxed py-0.5">{item.label}</span>}
      </div>
      {!isCollapsed && item.badge && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${isActive ? 'bg-blue-200 text-blue-800' : item.badgeColor || 'bg-blue-100 text-blue-700'} `}>
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
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const { notifications, unreadCount, dismissNotification } = useNotifications();
  const { searchQuery, setSearchQuery, clearSearch } = useSearch();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Protect the route
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

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

  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: () => billingApi.getSubscription(),
    enabled: !!user?.id,
    staleTime: 1000 * 30, // 30 seconds (was 5 minutes - too long for fresh subscription data)
    refetchInterval: 1000 * 60, // Refetch every minute to catch subscription changes
  });

  // Early return for loading state - AFTER all hooks are called
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userEmail = user?.email || '';
  // Split display logic:
  // 1. Dashboard Header: Priorities Business Name -> "New Business"
  const businessName = profile?.business_name || 'New Business';

  // 2. Profile Dropdown: Priorities API Profile Name -> Session User Name -> Email -> "User"
  const userFullName = profile?.full_name || user?.full_name || user?.user_metadata?.full_name || userEmail;

  const hasActiveSubscription = subscription && (subscription.status === 'active' || subscription.status === 'trialing');

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const firstLetter = (userFullName || businessName).charAt(0).toUpperCase();

  return (
    <>
      <NavigationGuard isAuthenticated={!!user} />
      {/* Main Container - Using DS OffWhite for background */}
      <div className="h-screen h-[100dvh] flex font-sans overflow-hidden bg-[hsl(var(--ds-off-white))]">

        {/* SIDEBAR - Using DS White for surface */}
        <aside
          className={cn(
            "hidden md:flex flex-col h-full transition-all duration-300 ease-in-out border-r border-slate-100 bg-[hsl(var(--ds-white))]",
            sidebarOpen ? 'w-[288px]' : 'w-[80px]'
          )}
        >

          {/* Logo Header */}
          <div className={cn(
            "h-20 flex items-center transition-all duration-300",
            sidebarOpen ? 'justify-between px-8' : 'justify-center px-4'
          )}>
            <Link
              to="/dashboard"
              className={cn(
                "flex items-center transition-all duration-300 group cursor-pointer no-underline",
                sidebarOpen ? 'px-6' : 'justify-center w-full px-4'
              )}
            >
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="VocalScale AI Phone Agent" width="428" height="428" className="w-10 h-10 flex-shrink-0 object-contain group-hover:scale-105 transition-transform" />
                {sidebarOpen && (
                  <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">VocalScale</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">AI Phone Agent</span>
                  </div>
                )}
              </div>
            </Link>

            {/* Toggle Button (Only visible when open) */}
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-[hsl(var(--ds-stone))]"
                aria-label="Collapse sidebar"
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
              isActive={isActive('/dashboard/dashboard')}
            />
            <NavItem
              item={{ path: '/dashboard/chat', label: 'AI Chat', icon: Brain }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/chat')}
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
            <NavItem
              item={{ path: '/dashboard/inventory', label: 'Inventory', icon: Package }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/inventory')}
            />

            <div className="mt-auto">
              {/* Sidebar Header for Desktop Only */}
              <div className="hidden lg:block pt-6 mt-6">
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
          {!isLoadingSubscription && !hasActiveSubscription && (
            <div className="p-3 border-t space-y-2" style={{ borderColor: DS.border, backgroundColor: DS.surface }}>
              {/* Promo Card / Plan Badge */}
              {sidebarOpen && (
                <div className={`relative overflow-hidden rounded-xl p-3 shadow-sm border transition-all duration-500 group hover:shadow-lg bg-white border-slate-100 hover:border-blue-200`}>
                  {/* Decorative background element */}
                  <div className="absolute -right-3 -top-3 w-12 h-12 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-700" />

                  <div className="flex items-center gap-2 mb-1.5 relative z-10">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110 bg-blue-50 text-blue-600`}>
                      <Zap size={12} strokeWidth={2.5} />
                    </div>
                    <h4 className={`text-[10px] font-black uppercase tracking-widest text-slate-900`}>
                      Upgrade
                    </h4>
                  </div>

                  <div className="relative z-10">
                    <p className="text-[9px] leading-tight mb-2 font-medium text-slate-500">Unlock unlimited AI minutes & models.</p>
                    <Link
                      to="/dashboard/billing/plans"
                      className="w-full py-1.5 flex items-center justify-center bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-200 no-underline"
                    >
                      View Plans
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

        </aside>

        {/* MAIN CONTENT WRAPPER */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

          {/* TOP NAVIGATION BAR */}
          <header className="h-20 backdrop-blur-xl border-b border-slate-100 shrink-0 z-30 px-2 md:px-10 flex items-center justify-between transition-all duration-300" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>

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
                  className="w-full pl-11 pr-12 py-2.5 border rounded-xl text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-[hsl(var(--ds-electric-tint))] border-[hsl(var(--ds-border))] bg-[hsl(var(--ds-white))] text-[hsl(var(--ds-ink))] focus:border-[hsl(var(--ds-electric))]"
                />
                {/* Keyboard shortcut hint */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded transition-opacity pointer-events-none border bg-[hsl(var(--ds-surface))] text-[hsl(var(--ds-stone))] border-[hsl(var(--ds-border))]">
                  <span className="text-[10px] font-bold">⌘ K</span>
                </div>
                {/* Clear button */}
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors text-[hsl(var(--ds-subtle-text))]"
                    aria-label="Clear search"
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
              <div className="flex items-center gap-1 border-r pr-2 md:pr-4 border-[hsl(var(--ds-border))]">
                <Link
                  to="/dashboard/billing"
                  className={cn(
                    "hidden sm:flex items-center justify-center p-2.5 rounded-xl transition-all relative group border border-transparent hover:bg-slate-50 no-underline",
                    isActive('/dashboard/billing') ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-slate-500 hover:border-slate-200'
                  )}
                  aria-label="Billing"
                >
                  <CreditCard size={20} strokeWidth={isActive('/dashboard/billing') ? 2.5 : 2} />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                    aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''} `}
                    className={cn(
                      "p-2.5 rounded-xl transition-all relative outline-none group",
                      notificationPanelOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                    )}
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
                  className={cn(
                    "flex items-center gap-3 p-1 pl-3 rounded-full transition-all duration-200",
                    profileDropdownOpen ? 'bg-slate-100 ring-2 ring-slate-100' : 'bg-transparent hover:bg-slate-50'
                  )}
                >
                  <div className="hidden lg:flex flex-col items-end text-right">
                    <span className="text-xs font-bold text-slate-900 leading-tight">{businessName}</span>
                    <span className="text-[10px] font-medium text-slate-500 leading-tight">{userFullName}</span>
                  </div>

                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-white">
                    {firstLetter}
                  </div>
                </button>
                <ProfileDropdown
                  isOpen={profileDropdownOpen}
                  onClose={() => setProfileDropdownOpen(false)}
                  onSignOut={handleSignOut}
                  displayName={userFullName}
                  email={userEmail}
                  avatarUrl={profile?.avatar_url || user?.avatar_url}
                />
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main
            className={cn(
              "flex-1 bg-[hsl(var(--ds-off-white))]",
              fullWidth ? 'p-0 overflow-hidden' : cn(PAGE_PADDING, "overflow-y-auto")
            )}
            onDoubleClick={() => {
              if (sidebarOpen) setSidebarOpen(false);
            }}
          >
            {children}
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
                  <NavItem
                    item={{ path: '/dashboard/chat', label: 'AI Chat', icon: Brain }}
                    isActive={isActive('/dashboard/chat')}
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
                  <NavItem
                    item={{ path: '/dashboard/inventory', label: 'Inventory', icon: Package }}
                    isActive={isActive('/dashboard/inventory')}
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