import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Menu,
  Bell,
  Search,
  Globe,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { CURRENCIES, APP_NAME } from '../../lib/constants';
import { useBudgets } from '../../hooks/useBudgets';
import { useTransactions } from '../../hooks/useTransactions';
import { useSavings } from '../../hooks/useSavings';
import { formatCurrency } from '../../lib/formatters';
import SpotlightSearchModal from './SpotlightSearchModal';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/savings': 'Savings Goals',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function Header() {
  const { toggleSidebar, currency, setCurrency, isConverted, rateBadgeText, baseCurrency } = useApp();
  const { user, profile } = useAuth();
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || APP_NAME;

  // Notifications state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('spendwise_read_notifications') || '[]');
    } catch {
      return [];
    }
  });

  // Global Spotlight Search state & keyboard shortcut (Ctrl+K / Cmd+K)
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  useEffect(() => {
    function handleGlobalKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSpotlightOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const dropdownRef = useRef(null);

  // Live data hooks for dynamic notifications
  const { transactions } = useTransactions();
  const { budgets } = useBudgets(undefined, transactions);
  const { goals } = useSavings();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const firstName = displayName.split(' ')[0] || 'User';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
      }
    }

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notificationsOpen]);

  // Compute smart notifications from active budgets, goals & activity
  const notifications = useMemo(() => {
    const list = [];

    // 1. Budget Alerts
    budgets.forEach((b) => {
      const limit = Number(b.limit_amount ?? b.limit ?? 0);
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.category === b.category)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      if (limit > 0 && spent > limit) {
        list.push({
          id: `budget-over-${b.id || b.category}`,
          type: 'danger',
          title: `Budget Exceeded: ${b.category}`,
          message: `Over by ${formatCurrency(spent - limit, currency)}. Limit is ${formatCurrency(
            limit,
            currency
          )}.`,
          link: '/budgets',
          time: 'Active Alert',
        });
      } else if (limit > 0 && spent / limit >= 0.85) {
        list.push({
          id: `budget-near-${b.id || b.category}`,
          type: 'warning',
          title: `Near Budget Limit: ${b.category}`,
          message: `You've used ${((spent / limit) * 100).toFixed(0)}% of your allowance.`,
          link: '/budgets',
          time: 'Warning',
        });
      }
    });

    // 2. Savings Goal Milestones
    goals.forEach((g) => {
      const target = Number(g.target_amount || 0);
      const current = Number(g.current_amount || 0);
      if (target > 0 && current >= target) {
        list.push({
          id: `savings-completed-${g.id}`,
          type: 'success',
          title: `Goal Achieved: ${g.name}! 🎉`,
          message: `Target of ${formatCurrency(target, currency)} reached! Fantastic milestone!`,
          link: '/savings',
          time: 'Milestone',
        });
      } else if (target > 0 && current / target >= 0.75) {
        list.push({
          id: `savings-near-${g.id}`,
          type: 'info',
          title: `Goal Update: ${g.name}`,
          message: `75%+ completed (${formatCurrency(current, currency)} / ${formatCurrency(
            target,
            currency
          )}).`,
          link: '/savings',
          time: 'Progress',
        });
      }
    });

    // 3. Welcome / System Notification
    list.push({
      id: 'system-welcome',
      type: 'system',
      title: `Welcome to ${APP_NAME} (T&S)`,
      message: 'Your personal finance ledger is secured and synced in real-time.',
      link: '/dashboard',
      time: 'System',
    });

    return list;
  }, [budgets, transactions, goals, currency]);

  // Unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readIds.includes(n.id)).length;
  }, [notifications, readIds]);

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem('spendwise_read_notifications', JSON.stringify(allIds));
    } catch {}
  };

  const markSingleAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem('spendwise_read_notifications', JSON.stringify(updated));
      } catch {}
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0c0d12]/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{pageTitle}</h1>
            <p className="text-xs text-zinc-500 hidden sm:block">{today}</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Quick Currency Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-zinc-300">
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-xs font-medium text-zinc-300"
              title="Change display currency (converts amounts via official rates)"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code} className="bg-[#12131a] text-zinc-200">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Official Rate Conversion Indicator */}
          {isConverted && rateBadgeText && (
            <div
              className="hidden lg:flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-1 rounded-lg bg-red-950/40 text-red-400 border border-red-900/50"
              title={`Converted using official rates against your base ledger (${baseCurrency})`}
            >
              <span>{rateBadgeText}</span>
            </div>
          )}

          {/* Global Spotlight Search Trigger */}
          <button
            type="button"
            onClick={() => setSpotlightOpen(true)}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-850 hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700/60 transition-all group"
            title="Global Spotlight Search (Ctrl + K)"
            aria-label="Open Global Spotlight Search"
          >
            <Search className="w-5 h-5 sm:w-4 sm:h-4 group-hover:text-red-400 transition-colors" />
            <span className="hidden md:inline text-xs text-zinc-400 font-medium group-hover:text-zinc-200">
              Search...
            </span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300 group-hover:border-zinc-700">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </button>

          {/* Interactive Notifications Center */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`relative p-2 rounded-xl transition-colors ${
                notificationsOpen
                  ? 'bg-red-950/60 text-red-400 border border-red-800/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              aria-label="Open notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md shadow-red-950/80">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#12131a] rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-red-950/60 text-red-400 border border-red-800/40 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
                  {notifications.map((n) => {
                    const isUnread = !readIds.includes(n.id);
                    return (
                      <div
                        key={n.id}
                        onClick={() => markSingleAsRead(n.id)}
                        className={`p-3.5 hover:bg-zinc-800/50 transition-colors flex items-start gap-3 ${
                          isUnread ? 'bg-red-950/20' : ''
                        }`}
                      >
                        {/* Status Icon */}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            n.type === 'danger'
                              ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                              : n.type === 'warning'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                              : n.type === 'success'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : 'bg-zinc-800 text-zinc-300 border border-zinc-700/40'
                          }`}
                        >
                          {n.type === 'danger' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : n.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : n.type === 'success' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-zinc-100 truncate">
                              {n.title}
                            </p>
                            <span className="text-[10px] font-medium text-zinc-500">
                              {n.time}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                          {n.link && (
                            <Link
                              to={n.link}
                              onClick={() => setNotificationsOpen(false)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 mt-1.5"
                            >
                              View details
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>

                        {/* Unread indicator dot */}
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] mt-2 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="p-2.5 bg-zinc-900 border-t border-zinc-800 text-center">
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs text-zinc-400 hover:text-zinc-200 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          <Link
            to="/settings"
            className="hidden sm:flex items-center gap-2 ml-1 pl-3 border-l border-zinc-800 hover:opacity-85 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-rose-900 flex items-center justify-center shadow-md shadow-red-950/60">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            <span className="text-sm font-medium text-zinc-200">{firstName}</span>
          </Link>
        </div>
      </div>

      {/* Global Spotlight Search Modal */}
      <SpotlightSearchModal
        isOpen={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        transactions={transactions}
        budgets={budgets}
        goals={goals}
        currency={currency}
      />
    </header>
  );
}
