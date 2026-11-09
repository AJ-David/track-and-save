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
import { CURRENCIES } from '../../lib/constants';
import { useBudgets } from '../../hooks/useBudgets';
import { useTransactions } from '../../hooks/useTransactions';
import { useSavings } from '../../hooks/useSavings';
import { formatCurrency } from '../../lib/formatters';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/savings': 'Savings Goals',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function Header() {
  const { toggleSidebar, currency, setCurrency } = useApp();
  const { user, profile } = useAuth();
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'SpendWise';

  // Notifications state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('spendwise_read_notifications') || '[]');
    } catch {
      return [];
    }
  });

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
      title: 'Welcome to SpendWise',
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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-xs text-gray-500 hidden sm:block">{today}</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Quick Currency Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-700">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-xs font-medium text-gray-700"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Search quick link */}
          <Link
            to="/transactions"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Search transactions"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Interactive Notifications Center */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`relative p-2 rounded-xl transition-colors ${
                notificationsOpen
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Open notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.map((n) => {
                    const isUnread = !readIds.includes(n.id);
                    return (
                      <div
                        key={n.id}
                        onClick={() => markSingleAsRead(n.id)}
                        className={`p-3.5 hover:bg-gray-50/80 transition-colors flex items-start gap-3 ${
                          isUnread ? 'bg-emerald-50/20' : ''
                        }`}
                      >
                        {/* Status Icon */}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            n.type === 'danger'
                              ? 'bg-rose-50 text-rose-600'
                              : n.type === 'warning'
                              ? 'bg-amber-50 text-amber-600'
                              : n.type === 'success'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-blue-50 text-blue-600'
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
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {n.title}
                            </p>
                            <span className="text-[10px] font-medium text-gray-400">
                              {n.time}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                          {n.link && (
                            <Link
                              to={n.link}
                              onClick={() => setNotificationsOpen(false)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 mt-1.5"
                            >
                              View details
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>

                        {/* Unread indicator dot */}
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium"
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
            className="hidden sm:flex items-center gap-2 ml-1 pl-3 border-l border-gray-100 hover:opacity-85 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-emerald-600">{initials}</span>
            </div>
            <span className="text-sm font-medium text-gray-700">{firstName}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
