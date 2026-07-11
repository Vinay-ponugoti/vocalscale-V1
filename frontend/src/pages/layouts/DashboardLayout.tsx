import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDashboardLayout } from './layoutOptions';
import {
  LayoutDashboard,
  HelpCircle,
  Settings,
  ChevronRight,
  CheckCircle2,
  LogOut,
  Bell,
  Menu,
  X,
  PhoneCall,
  Calendar,
  Building2,
  Search,
  Gauge,
  Layers,
  CreditCard,
  Star,
  Brain,
  BookOpen,
  Bot,
  Users,
  TrendingUp,
  Megaphone,
  Sun,
  Moon
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


// 30% Charcoal / Slate

interface DashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  secondaryNav?: React.ReactNode;
  hideHeader?: boolean;
}

// --- UI COMPONENTS ---

// --- UI COMPONENTS ---

const SectionLabel = ({ label, sidebarOpen }: { label: string; sidebarOpen: boolean }) => (
  <h3 className={cn(
    "px-6 mt-8 mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-300 text-[hsl(var(--ds-subtle-text))]",
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
      className={`group relative flex items-center ${isCollapsed ? 'justify-center px-3' : 'justify-between px-5'} py-2.5 mx-2 rounded-[10px] text-sm font-medium transition-all duration-300 no-underline
        ${isActive
          ? 'text-slate-900 bg-slate-100 shadow-sm'
          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
        } `}
      onClick={onClick}
      title={isCollapsed ? item.label : undefined}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-400 rounded-r-full" />
      )}

      <div className={`flex items-center gap-3.5 ${isCollapsed ? 'justify-center' : ''} `}>
        <Icon size={17} strokeWidth={2.25} className={isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 transition-colors'} />
        {!isCollapsed && <span className="transition-colors leading-relaxed py-0.5">{item.label}</span>}
      </div>
      {!isCollapsed && item.badge && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${isActive ? 'bg-emerald-100 text-emerald-700' : item.badgeColor || 'bg-emerald-100 text-emerald-700'} `}>
          {item.badge}
        </span>
      )}
    </Link>
  );
};

export const DashboardChrome: React.FC<DashboardLayoutProps> = ({
  children,
  fullWidth = false,
  secondaryNav,
  hideHeader = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const { notifications, unreadCount, dismissNotification } = useNotifications();
  const { searchQuery, setSearchQuery, clearSearch } = useSearch();

  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (localStorage.getItem('vs-theme') as 'dark' | 'light') || 'dark'
  );
  const toggleTheme = () => setTheme(t => {
    const next = t === 'dark' ? 'light' : 'dark';
    localStorage.setItem('vs-theme', next);
    return next;
  });
  const themeClass = theme === 'dark' ? 'vs-dark' : 'vs-light';

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
      <div className={cn(themeClass, "h-screen w-full flex items-center justify-center bg-[hsl(var(--ds-off-white))]")}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
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
  const subscriptionStatusLabel = subscription?.status === 'trialing' ? 'Trial Active' : 'Plan Active';

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
      <div className={cn(themeClass, "h-screen h-[100dvh] flex font-sans overflow-hidden bg-[hsl(var(--ds-off-white))]")}>

        {/* SIDEBAR - Using DS White for surface */}
        <aside
          className={cn(
            "hidden md:flex flex-col h-full transition-all duration-300 ease-in-out border-r border-[hsl(var(--ds-border))] bg-[hsl(var(--ds-surface))]",
            sidebarOpen ? 'w-[288px]' : 'w-[80px]'
          )}
          onDoubleClick={() => setSidebarOpen(o => !o)}
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
                <img src="/logo.png" alt="VocalScale" width="428" height="428" className="w-10 h-10 flex-shrink-0 object-contain group-hover:scale-105 transition-transform" />
                {sidebarOpen && (
                  <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">VocalScale</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reception Desk</span>
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
              isActive={isActive('/dashboard')}
            />
            <NavItem
              item={{ path: '/dashboard/insights', label: 'Performance', icon: TrendingUp }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/insights')}
            />
            <NavItem
              item={{ path: '/dashboard/chat', label: 'Assistant Chat', icon: Brain }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/chat')}
            />

            <SectionLabel label="Operations" sidebarOpen={sidebarOpen} />
            <NavItem
              item={{ path: '/dashboard/calls', label: 'Call Logs', icon: PhoneCall }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/calls')}
            />
            <NavItem
              item={{ path: '/dashboard/contacts', label: 'Contacts', icon: Users }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/contacts')}
            />
            <NavItem
              item={{ path: '/dashboard/campaigns', label: 'Campaigns', icon: Megaphone }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/campaigns')}
            />
            <NavItem
              item={{ path: '/dashboard/appointments', label: 'Appointments', icon: Calendar }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/appointments')}
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
              item={{ path: '/dashboard/agents', label: 'Agents', icon: Bot }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/agents')}
            />
            <NavItem
              item={{ path: '/dashboard/knowledge', label: 'Knowledge', icon: BookOpen }}
              isCollapsed={!sidebarOpen}
              isActive={isActive('/dashboard/knowledge')}
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
                className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-5' : 'justify-center'} py-3 text-sm font-medium rounded-[10px] transition-all duration-300 group text-slate-400 hover:bg-rose-50 hover:text-rose-600`}
              >
                <LogOut size={18} strokeWidth={2.5} className={sidebarOpen ? 'mr-3 group-hover:-translate-x-1 transition-transform' : ''} />
                {sidebarOpen && <span>Log Out</span>}
              </button>
            </div>
          </div>

          {/* Bottom Plan Status */}
          {!isLoadingSubscription && (
            <div className={cn(
              "p-3 border-t border-[hsl(var(--ds-border))] bg-[hsl(var(--ds-surface))]",
              !sidebarOpen && "flex justify-center"
            )}>
              {hasActiveSubscription ? (
                sidebarOpen ? (
                  <div className="rounded-lg border border-emerald-100 bg-white p-3 shadow-sm">
                    <div className="mb-1.5 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={12} strokeWidth={2.5} />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                        {subscriptionStatusLabel}
                      </h4>
                    </div>

                    <div>
                      <p className="mb-2 text-[10px] font-medium leading-snug text-slate-500">Usage, invoices, and plan details are in Billing.</p>
                      <Link
                        to="/dashboard/billing"
                        className="flex w-full items-center justify-center rounded-md border border-slate-200 bg-white py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-700 no-underline transition-colors hover:bg-slate-50"
                      >
                        Open Billing
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/dashboard/billing"
                    title={subscriptionStatusLabel}
                    aria-label={subscriptionStatusLabel}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 no-underline transition-colors hover:bg-emerald-100"
                  >
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                  </Link>
                )
              ) : sidebarOpen ? (
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-slate-300">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                      <Gauge size={12} strokeWidth={2.5} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                      Call Capacity
                    </h4>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-medium leading-snug text-slate-500">Review your plan when call volume starts climbing.</p>
                    <Link
                      to="/dashboard/billing/plans"
                      className="flex w-full items-center justify-center rounded-md bg-slate-900 py-1.5 text-[9px] font-black uppercase tracking-wider text-white no-underline transition-colors hover:bg-slate-700"
                    >
                      Review Plans
                    </Link>
                  </div>
                </div>
              ) : (
                /* Collapsed: icon-only button (matches NavItem collapsed pattern) */
                <Link
                  to="/dashboard/billing/plans"
                  title="Review plans"
                  aria-label="Review plans"
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white no-underline transition-colors hover:bg-slate-700"
                >
                  <Gauge size={18} strokeWidth={2.5} />
                </Link>
              )}
            </div>
          )}

        </aside>

        {/* MAIN CONTENT WRAPPER */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

          {/* TOP NAVIGATION BAR — hidden for fullscreen pages like Chat */}
          {!hideHeader && <header className="h-20 backdrop-blur-xl border-b border-[hsl(var(--ds-border))] shrink-0 z-50 px-2 md:px-10 flex items-center justify-between transition-all duration-300 bg-[hsl(var(--ds-off-white)/0.85)]">

            {/* Mobile Menu Toggle - Always visible on mobile, positioned at start */}
            <button
              className="md:hidden p-2.5 rounded-xl flex-shrink-0 text-[hsl(var(--ds-charcoal))] bg-[hsl(var(--ds-white))]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
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
                  <Search size={18} strokeWidth={2.5} className="text-[hsl(var(--ds-subtle-text))] group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  role="searchbox"
                  aria-label="Search dashboard"
                  placeholder="Search logs, appointments..."
                  value={localSearch}
                  onChange={(event) => setLocalSearch(event.target.value)}
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
                <button
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                  title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
                  className="p-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                >
                  {theme === 'dark' ? <Sun size={20} strokeWidth={2.25} /> : <Moon size={20} strokeWidth={2.25} />}
                </button>
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
                    onSelect={(id) => {
                      const notification = notifications.find(n => n.id === id);
                      if (!notification) return;

                      setNotificationPanelOpen(false);

                      // Navigate based on category
                      if (notification.category === 'Booking') {
                        navigate('/dashboard/appointments');
                      } else if (notification.category === 'Missed Call' || notification.category === 'Action Req') {
                        navigate('/dashboard/calls');
                      } else {
                        // Default fallback
                        navigate('/dashboard');
                      }
                    }}
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

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white ring-2 ring-white">
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
          </header>}

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
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-300 bg-[hsl(var(--ds-surface))]" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="VocalScale" width="428" height="428" className="w-10 h-10 object-contain" />
                    <span className="text-2xl font-black tracking-tight text-slate-900">VocalScale</span>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl text-[hsl(var(--ds-stone))] bg-[hsl(var(--ds-surface))]" aria-label="Close menu">
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
                    item={{ path: '/dashboard/insights', label: 'Performance', icon: TrendingUp }}
                    isActive={isActive('/dashboard/insights')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <NavItem
                    item={{ path: '/dashboard/chat', label: 'Assistant Chat', icon: Brain }}
                    isActive={isActive('/dashboard/chat')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                </div>

                <div>
                  <SectionLabel label="Operations" sidebarOpen={true} />
                  <NavItem
                    item={{ path: '/dashboard/calls', label: 'Call Logs', icon: PhoneCall }}
                    isActive={isActive('/dashboard/calls')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <NavItem
                    item={{ path: '/dashboard/contacts', label: 'Contacts', icon: Users }}
                    isActive={isActive('/dashboard/contacts')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <NavItem
                    item={{ path: '/dashboard/campaigns', label: 'Campaigns', icon: Megaphone }}
                    isActive={isActive('/dashboard/campaigns')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <NavItem
                    item={{ path: '/dashboard/appointments', label: 'Appointments', icon: Calendar }}
                    isActive={isActive('/dashboard/appointments')}
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
                    item={{ path: '/dashboard/agents', label: 'Agents', icon: Bot }}
                    isActive={isActive('/dashboard/agents')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <NavItem
                    item={{ path: '/dashboard/knowledge', label: 'Knowledge', icon: BookOpen }}
                    isActive={isActive('/dashboard/knowledge')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                </div>

                <div className="pt-6 border-t mt-6 border-[hsl(var(--ds-border))]">
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
                    className="w-full flex items-center justify-start px-5 py-3 mx-2 text-sm font-medium rounded-[10px] transition-colors group mt-4 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
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

/**
 * Page-facing wrapper. Kept for backwards compatibility so pages can continue to use
 * <DashboardLayout fullWidth>…</DashboardLayout>. It no longer renders the sidebar/header
 * itself — DashboardShell does that once — it just forwards layout options to the shell
 * and renders the page content.
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, fullWidth, secondaryNav, hideHeader }) => {
  useDashboardLayout({ fullWidth, secondaryNav, hideHeader });
  return <>{children}</>;
};

export default DashboardLayout;
