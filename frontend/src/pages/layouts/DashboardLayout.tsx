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
  Hash,
  CreditCard,
  Star,
  BookOpen,
  Bot,
  Users,
  TrendingUp,
  Megaphone,
  Sun,
  Moon,
  Sparkles
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
import CopilotDrawer from '../../components/copilot/CopilotDrawer';
import { openCopilot, surfaceForPath } from '../../lib/copilot';


interface DashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  secondaryNav?: React.ReactNode;
  hideHeader?: boolean;
}

type NavItemDef = { path: string; label: string; icon: React.ElementType };

// Single source for the sidebar, the mobile menu and the top-bar breadcrumb.
const NAV_SECTIONS: Array<{ label: string; items: NavItemDef[] }> = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/dashboard/insights', label: 'Performance', icon: TrendingUp },
    ],
  },
  {
    label: 'Activity',
    items: [
      { path: '/dashboard/calls', label: 'Call logs', icon: PhoneCall },
      { path: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
      { path: '/dashboard/contacts', label: 'Contacts', icon: Users },
      { path: '/dashboard/campaigns', label: 'Campaigns', icon: Megaphone },
      { path: '/dashboard/reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    label: 'Agent setup',
    items: [
      { path: '/dashboard/agents', label: 'Agents', icon: Bot },
      { path: '/dashboard/knowledge', label: 'Knowledge base', icon: BookOpen },
      { path: '/dashboard/business-details', label: 'Business profile', icon: Building2 },
      { path: '/dashboard/voice-setup', label: 'Phone numbers', icon: Hash },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/dashboard/settings', label: 'Settings', icon: Settings },
      { path: '/dashboard/billing', label: 'Billing', icon: CreditCard },
      { path: '/dashboard/help', label: 'Help center', icon: HelpCircle },
    ],
  },
];

const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items.map((item) => ({ ...item, section: section.label })));

// Child pages shown as "Parent › Child" in the top bar.
const SUB_PAGES: Array<[string, string]> = [
  ['/dashboard/voice-setup/setup-subaccount', 'Connect provider'],
  ['/dashboard/voice-setup/numbers/', 'Number details'],
  ['/dashboard/voice-setup/buy', 'Add number'],
  ['/dashboard/billing/plans', 'Plans'],
  ['/dashboard/contacts/', 'Contact'],
  ['/dashboard/calls/', 'Call details'],
];

// Pages that are not in the sidebar: [path prefix, section, title].
const EXTRA_PAGES: Array<[string, string, string]> = [
  ['/dashboard/chat', 'Overview', 'Copilot'],
  ['/dashboard/voice-model/', 'Agent setup', 'Voice model'],
];

const SectionLabel = ({ label, sidebarOpen }: { label: string; sidebarOpen: boolean }) => (
  <h3 className={cn(
    "px-5 mt-6 mb-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 text-slate-400",
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
  item: NavItemDef;
  isCollapsed?: boolean;
  isActive: boolean;
  onClick?: () => void;
}) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={`group relative flex items-center ${isCollapsed ? 'justify-center px-3' : 'justify-between px-4'} py-2 mx-2 rounded-lg text-[13px] font-medium transition-all duration-200 no-underline
        ${isActive
          ? 'text-slate-950 bg-blue-50'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        } `}
      onClick={onClick}
      title={isCollapsed ? item.label : undefined}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r-full" />
      )}

      <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''} `}>
        <Icon size={17} strokeWidth={2.1} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700 transition-colors'} />
        {!isCollapsed && <span className="transition-colors leading-6">{item.label}</span>}
      </div>
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
    (localStorage.getItem('vs-theme') as 'dark' | 'light') || 'light'
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
  const subscriptionStatusLabel = subscription?.status === 'trialing' ? 'Trial active' : 'Plan active';

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // Breadcrumb: section › page (› sub-page), all derived from NAV_SECTIONS.
  const navMatch = NAV_ITEMS
    .filter((item) => isActive(item.path))
    .sort((a, b) => b.path.length - a.path.length)[0];
  const subPage = SUB_PAGES.find(([path]) => location.pathname.startsWith(path))?.[1];
  const extraPage = EXTRA_PAGES.find(([path]) => location.pathname.startsWith(path));
  const sectionLabel = navMatch?.section ?? extraPage?.[1] ?? 'Overview';
  const routeTitle = subPage ?? navMatch?.label ?? extraPage?.[2] ?? 'Dashboard';

  const renderNav = (collapsed: boolean, onNavigate?: () => void) =>
    NAV_SECTIONS.map((section) => (
      <div key={section.label}>
        <SectionLabel label={section.label} sidebarOpen={!collapsed} />
        {section.items.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isCollapsed={collapsed}
            isActive={isActive(item.path)}
            onClick={onNavigate}
          />
        ))}
      </div>
    ));

  // Call logs has its own search next to the list, so only Appointments uses the top-bar search.
  const searchPlaceholder = location.pathname.startsWith('/dashboard/appointments') ? 'Search appointments…' : null;
  const callDetailMatch = location.pathname.match(/^\/dashboard\/calls\/([^/]+)/);

  const firstLetter = (userFullName || businessName).charAt(0).toUpperCase();

  return (
    <>
      <NavigationGuard isAuthenticated={!!user} />
      {/* Main Container - Using DS OffWhite for background */}
      <div className={cn(themeClass, "vs-app vs-app-shell h-screen h-[100dvh] flex font-sans overflow-hidden bg-[hsl(var(--ds-off-white))]")}>

        {/* SIDEBAR - Using DS White for surface */}
        <aside
          className={cn(
            "vs-app-sidebar relative hidden md:flex flex-col h-full transition-all duration-300 ease-in-out border-r border-[hsl(var(--ds-border))] bg-[hsl(var(--ds-surface))]",
            sidebarOpen ? 'w-[264px]' : 'w-[76px]'
          )}
          onDoubleClick={() => setSidebarOpen(o => !o)}
        >

          {/* Logo Header */}
          <div className={cn(
            "h-[72px] shrink-0 flex items-center transition-all duration-300 border-b border-[hsl(var(--ds-border))]",
            sidebarOpen ? 'px-5' : 'justify-center px-3'
          )}>
            <Link
              to="/dashboard"
              className={cn(
                "flex items-center transition-all duration-300 group cursor-pointer no-underline",
                sidebarOpen ? 'px-1' : 'justify-center w-full px-2'
              )}
            >
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="VocalScale" width="428" height="428" className="w-9 h-9 flex-shrink-0 object-contain group-hover:scale-105 transition-transform" />
                {sidebarOpen && (
                  <div className="flex flex-col">
                    <span className="text-[17px] font-semibold tracking-[-0.03em] text-slate-950 transition-colors">VocalScale</span>
                    <span className="text-[11px] text-slate-400">AI phone desk</span>
                  </div>
                )}
              </div>
            </Link>

          </div>

          {/* Edge toggle, visible in both states */}
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            className="absolute -right-3 top-[60px] z-[60] flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:text-slate-700"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronRight size={14} strokeWidth={2.5} className={sidebarOpen ? 'rotate-180' : ''} />
          </button>

          {/* Scrollable Nav Area */}
          <div className="flex-1 overflow-y-auto pb-4 overflow-x-hidden scrollbar-hide">

            {renderNav(!sidebarOpen)}

            <button
              onClick={handleSignOut}
              className={cn(
                "mt-6 mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg py-2 text-[13px] font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600",
                sidebarOpen ? 'justify-start px-4' : 'justify-center px-3'
              )}
              title={sidebarOpen ? undefined : 'Sign out'}
            >
              <LogOut size={17} strokeWidth={2.1} />
              {sidebarOpen && <span>Sign out</span>}
            </button>
          </div>

          {/* Bottom Plan Status */}
          {!isLoadingSubscription && (
            <div className={cn(
              "p-3 border-t border-[hsl(var(--ds-border))] bg-[hsl(var(--ds-surface))]",
              !sidebarOpen && "flex justify-center"
            )}>
              {hasActiveSubscription ? (
                sidebarOpen ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="mb-1.5 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={12} strokeWidth={2.5} />
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900">
                        {subscriptionStatusLabel}
                      </h4>
                    </div>

                    <div>
                      <p className="mb-2.5 text-[11px] leading-snug text-slate-500">Usage, invoices, and plan details are in Billing.</p>
                      <Link
                        to="/dashboard/billing"
                        className="flex h-8 w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 no-underline transition-colors hover:bg-slate-50"
                      >
                        Open billing
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
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                      <Gauge size={12} strokeWidth={2.5} />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900">
                      No active plan
                    </h4>
                  </div>

                  <div>
                    <p className="mb-2.5 text-[11px] leading-snug text-slate-500">Choose a plan so your agent can keep answering calls.</p>
                    <Link
                      to="/dashboard/billing/plans"
                      className="flex h-8 w-full items-center justify-center rounded-lg bg-blue-600 text-xs font-semibold text-white no-underline transition-colors hover:bg-blue-700"
                    >
                      View plans
                    </Link>
                  </div>
                </div>
              ) : (
                /* Collapsed: icon-only button (matches NavItem collapsed pattern) */
                <Link
                  to="/dashboard/billing/plans"
                  title="View plans"
                  aria-label="View plans"
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white no-underline transition-colors hover:bg-blue-700"
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
          {!hideHeader && <header className="vs-app-header h-[72px] backdrop-blur-xl border-b border-[hsl(var(--ds-border))] shrink-0 z-50 gap-3 px-4 md:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 bg-[hsl(var(--ds-off-white)/0.85)]">

            {/* Mobile Menu Toggle - Always visible on mobile, positioned at start */}
            <button
              className="md:hidden flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Breadcrumb: section › page (› sub-page). Keeps users oriented on nested pages. */}
            <nav aria-label="Breadcrumb" className="vs-route-context flex min-w-0 shrink-0 flex-col gap-1 lg:mr-4">
              <span className="vs-route-context__eyebrow hidden sm:block">{sectionLabel}</span>
              <span className="vs-route-context__title flex min-w-0 items-center gap-1.5">
                {subPage && navMatch ? (
                  <>
                    <Link to={navMatch.path} className="hidden truncate text-slate-500 no-underline hover:text-slate-900 sm:inline">
                      {navMatch.label}
                    </Link>
                    <ChevronRight size={13} className="hidden shrink-0 text-slate-300 sm:block" />
                    <span className="truncate">{subPage}</span>
                  </>
                ) : (
                  <span className="truncate">{routeTitle}</span>
                )}
              </span>
            </nav>

            {/* Search only appears on pages wired to the shared query. */}
            {searchPlaceholder ? <div className="hidden sm:flex flex-1 max-w-xl items-center">
              <div className="relative w-full group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <Search size={18} strokeWidth={2.5} className="text-[hsl(var(--ds-subtle-text))] group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  role="searchbox"
                  aria-label="Search dashboard"
                  placeholder={searchPlaceholder}
                  value={localSearch}
                  onChange={(event) => setLocalSearch(event.target.value)}
                  className="w-full pl-11 pr-12 py-2.5 border rounded-[10px] text-[13px] font-medium transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-[hsl(var(--ds-electric-tint))] border-[hsl(var(--ds-border))] bg-[hsl(var(--ds-white))] text-[hsl(var(--ds-ink))] focus:border-[hsl(var(--ds-electric))]"
                />
                {/* Keyboard shortcut hint */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded transition-opacity pointer-events-none border bg-[hsl(var(--ds-surface))] text-[hsl(var(--ds-stone))] border-[hsl(var(--ds-border))]">
                  <span className="text-[10px] font-bold">⌘ K</span>
                </div>
                {/* Clear button */}
                {localSearch && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors text-[hsl(var(--ds-subtle-text))]"
                    aria-label="Clear search"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div> : <div className="flex-1" />}

            {/* Secondary Nav / Filters Slot */}
            {secondaryNav && (
              <div className="hidden lg:flex items-center flex-1 px-8 max-w-2xl">
                {secondaryNav}
              </div>
            )}

            {/* Right: Actions & Profile */}
            <div className="flex shrink-0 items-center gap-2 md:gap-3">

              {/* Icon Actions */}
              <div className="flex items-center gap-1 border-r pr-2 md:pr-3 border-[hsl(var(--ds-border))]">
                <button
                  type="button"
                  onClick={() => openCopilot({
                    surface: surfaceForPath(location.pathname),
                    entityId: callDetailMatch?.[1],
                    title: routeTitle,
                  })}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-2.5 text-[13px] font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100 sm:px-3"
                  aria-label="Ask Copilot about this page"
                  title="Ask Copilot about this page"
                >
                  <Sparkles size={16} />
                  <span className="hidden xl:inline">Ask Copilot</span>
                </button>
                <button
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                  title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
                  className="flex h-10 w-10 items-center justify-center rounded-lg transition-all text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  {theme === 'dark' ? <Sun size={18} strokeWidth={2.1} /> : <Moon size={18} strokeWidth={2.1} />}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                    aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''} `}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-all relative outline-none group",
                      notificationPanelOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    )}
                  >
                    <Bell size={18} strokeWidth={2.1} />
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
                    "flex items-center gap-3 p-1 lg:pl-3 rounded-full transition-all duration-200",
                    profileDropdownOpen ? 'bg-slate-100 ring-2 ring-slate-100' : 'bg-transparent hover:bg-slate-50'
                  )}
                >
                  <div className="hidden lg:flex flex-col items-end text-right">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">{businessName}</span>
                    <span className="text-[11px] text-slate-500 leading-tight">{userFullName}</span>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white ring-2 ring-white">
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
              "vs-app-main flex-1 bg-[hsl(var(--ds-off-white))]",
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
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] shadow-2xl p-4 flex flex-col animate-in slide-in-from-left duration-300 bg-[hsl(var(--ds-surface))]" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="VocalScale" width="428" height="428" className="w-10 h-10 object-contain" />
                    <span className="text-lg font-semibold tracking-tight text-slate-900">VocalScale</span>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl text-[hsl(var(--ds-stone))] bg-[hsl(var(--ds-surface))]" aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>

              <div className="-mx-2 flex-1 overflow-y-auto">
                {renderNav(false, () => setMobileMenuOpen(false))}

                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="mt-6 mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-4 py-2 text-[13px] font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  <LogOut size={17} strokeWidth={2.1} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        )}
        <CopilotDrawer />
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
