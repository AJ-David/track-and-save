import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  LayoutDashboard,
  Receipt,
  PieChart,
  PiggyBank,
  BarChart3,
  Settings,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Command,
  CornerDownLeft,
  ArrowRight,
  Wallet,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/formatters';

const NAVIGATION_ITEMS = [
  {
    id: 'nav-dashboard',
    title: 'Dashboard',
    description: 'Financial pulse, net worth, overview & quick metrics',
    link: '/dashboard',
    category: 'Navigation',
    icon: LayoutDashboard,
    badge: 'Overview',
  },
  {
    id: 'nav-transactions',
    title: 'Transactions Ledger',
    description: 'View, filter, edit and export all income & expense logs',
    link: '/transactions',
    category: 'Navigation',
    icon: Receipt,
    badge: 'Ledger',
  },
  {
    id: 'nav-budgets',
    title: 'Budget Allocation',
    description: 'Manage monthly category spending limits & alerts',
    link: '/budgets',
    category: 'Navigation',
    icon: PieChart,
    badge: 'Limits',
  },
  {
    id: 'nav-savings',
    title: 'Savings Goals',
    description: 'Track reserves, targets & progress towards milestones',
    link: '/savings',
    category: 'Navigation',
    icon: PiggyBank,
    badge: 'Targets',
  },
  {
    id: 'nav-analytics',
    title: 'Financial Analytics',
    description: 'Cashflow trends, spending velocity & breakdown charts',
    link: '/analytics',
    category: 'Navigation',
    icon: BarChart3,
    badge: 'Reports',
  },
  {
    id: 'nav-settings',
    title: 'Settings & Profile',
    description: 'Currency preferences, account details and security',
    link: '/settings',
    category: 'Navigation',
    icon: Settings,
    badge: 'Preferences',
  },
];

const QUICK_ACTIONS = [
  {
    id: 'action-new-transaction',
    title: 'Record New Transaction',
    description: 'Log an income inflow or expense expenditure',
    link: '/transactions',
    category: 'Quick Actions',
    icon: PlusCircle,
    badge: 'Record',
  },
  {
    id: 'action-new-budget',
    title: 'Set Category Budget',
    description: 'Allocate spending boundaries for this month',
    link: '/budgets',
    category: 'Quick Actions',
    icon: PieChart,
    badge: 'Cap',
  },
  {
    id: 'action-new-goal',
    title: 'Create Savings Target',
    description: 'Start a new milestone fund or emergency reserve',
    link: '/savings',
    category: 'Quick Actions',
    icon: PiggyBank,
    badge: 'Save',
  },
];

export default function SpotlightSearchModal({
  isOpen,
  onClose,
  transactions = [],
  budgets = [],
  goals = [],
  currency = 'USD',
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const navigate = useNavigate();

  // Reset query and focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle global Escape & close
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute live search results across all modules
  const { groups, flattenedItems } = useMemo(() => {
    const clean = query.trim().toLowerCase();

    if (!clean) {
      // Default state: Navigation & Quick Actions
      const defaultGroups = [
        { name: 'Pages & Modules', items: NAVIGATION_ITEMS },
        { name: 'Quick Actions', items: QUICK_ACTIONS },
      ];
      const flat = [...NAVIGATION_ITEMS, ...QUICK_ACTIONS];
      return { groups: defaultGroups, flattenedItems: flat };
    }

    const matchedNav = NAVIGATION_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(clean) ||
        item.description.toLowerCase().includes(clean) ||
        item.badge.toLowerCase().includes(clean)
    );

    const matchedActions = QUICK_ACTIONS.filter(
      (item) =>
        item.title.toLowerCase().includes(clean) ||
        item.description.toLowerCase().includes(clean)
    );

    // Matching transactions
    const matchedTransactions = transactions
      .filter((t) => {
        const desc = (t.description || '').toLowerCase();
        const cat = (t.category || '').toLowerCase();
        const notes = (t.notes || '').toLowerCase();
        const amt = String(t.amount || '');
        return (
          desc.includes(clean) ||
          cat.includes(clean) ||
          notes.includes(clean) ||
          amt.includes(clean)
        );
      })
      .slice(0, 6)
      .map((t) => ({
        id: `tx-${t.id}`,
        title: t.description || 'Untitled Transaction',
        description: `${formatDate(t.date || t.created_at)} • ${t.category}`,
        link: '/transactions',
        category: 'Transactions',
        amount: t.amount,
        type: t.type,
        icon: t.type === 'income' ? ArrowUpRight : ArrowDownRight,
        badge: t.category,
      }));

    // Matching budgets
    const matchedBudgets = budgets
      .filter((b) => (b.category || '').toLowerCase().includes(clean))
      .slice(0, 4)
      .map((b) => {
        const limit = Number(b.limit_amount ?? b.limit ?? 0);
        return {
          id: `budget-${b.id || b.category}`,
          title: `${b.category} Budget`,
          description: `Spending ceiling: ${formatCurrency(limit, currency)}`,
          link: '/budgets',
          category: 'Budgets',
          icon: PieChart,
          badge: 'Limit',
        };
      });

    // Matching savings goals
    const matchedGoals = goals
      .filter((g) => (g.name || '').toLowerCase().includes(clean))
      .slice(0, 4)
      .map((g) => {
        const target = Number(g.target_amount || 0);
        const current = Number(g.current_amount || 0);
        const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
        return {
          id: `goal-${g.id}`,
          title: g.name,
          description: `${pct}% reached • ${formatCurrency(current, currency)} / ${formatCurrency(target, currency)}`,
          link: '/savings',
          category: 'Savings Goals',
          icon: PiggyBank,
          badge: `${pct}%`,
        };
      });

    const activeGroups = [];
    if (matchedNav.length > 0) {
      activeGroups.push({ name: 'Pages & Modules', items: matchedNav });
    }
    if (matchedTransactions.length > 0) {
      activeGroups.push({ name: 'Matching Transactions', items: matchedTransactions });
    }
    if (matchedBudgets.length > 0) {
      activeGroups.push({ name: 'Budget Allocations', items: matchedBudgets });
    }
    if (matchedGoals.length > 0) {
      activeGroups.push({ name: 'Savings Goals', items: matchedGoals });
    }
    if (matchedActions.length > 0) {
      activeGroups.push({ name: 'Quick Actions', items: matchedActions });
    }

    const flat = activeGroups.flatMap((g) => g.items);
    return { groups: activeGroups, flattenedItems: flat };
  }, [query, transactions, budgets, goals, currency]);

  // Keep selected index in bounds when list changes
  useEffect(() => {
    setSelectedIndex((prev) => {
      if (flattenedItems.length === 0) return 0;
      return Math.min(prev, flattenedItems.length - 1);
    });
  }, [flattenedItems]);

  // Execute selection
  const handleSelect = (item) => {
    if (!item) return;
    onClose();
    if (item.link) {
      navigate(item.link);
    }
  };

  // Keyboard navigation inside input
  const handleKeyDown = (e) => {
    if (flattenedItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flattenedItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flattenedItems.length) % flattenedItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = flattenedItems[selectedIndex];
      if (current) {
        handleSelect(current);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-24 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global Spotlight Search"
    >
      <div
        className="w-full max-w-2xl bg-[#12131a] border border-zinc-800 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[82vh] transform transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-zinc-800/80 bg-[#161722]/80">
          <Search className="w-5 h-5 text-red-500 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search transactions, budgets, goals, or pages..."
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-base font-medium outline-none border-none focus:ring-0"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors mr-2"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-[10px] font-semibold text-zinc-400">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[58vh] divide-y divide-zinc-800/50"
        >
          {flattenedItems.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-red-950/40 border border-red-900/40 flex items-center justify-center text-red-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-200 mb-1">
                No results found for &ldquo;{query}&rdquo;
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Check spelling or try searching for a category (e.g. &ldquo;Food&rdquo;), merchant,
                amount, budget, or page name.
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.name} className="pt-3 first:pt-0">
                <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                  <span>{group.name}</span>
                  <span className="text-[10px] font-medium text-zinc-600">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const itemGlobalIndex = flattenedItems.findIndex((x) => x.id === item.id);
                    const isSelected = itemGlobalIndex === selectedIndex;
                    const IconComponent = item.icon || Sparkles;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-100 ${
                          isSelected
                            ? 'bg-red-950/40 border border-red-800/60 text-white shadow-md shadow-red-950/30'
                            : 'border border-transparent text-zinc-300 hover:bg-zinc-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-red-600 text-white shadow-sm shadow-red-900'
                                : item.type === 'income'
                                ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                                : item.type === 'expense'
                                ? 'bg-red-950/40 text-red-400 border border-red-800/40'
                                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-semibold truncate ${
                                  isSelected ? 'text-white' : 'text-zinc-200'
                                }`}
                              >
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60 shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500 truncate mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Right side info / action */}
                        <div className="flex items-center gap-2 shrink-0">
                          {item.amount !== undefined && (
                            <span
                              className={`text-sm font-bold ${
                                item.type === 'income' ? 'text-emerald-400' : 'text-zinc-200'
                              }`}
                            >
                              {item.type === 'income' ? '+' : '-'}
                              {formatCurrency(item.amount, currency)}
                            </span>
                          )}
                          {isSelected ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-950/70 border border-red-800/60 px-2 py-0.5 rounded-md">
                              <span>Jump</span>
                              <CornerDownLeft className="w-3 h-3" />
                            </span>
                          ) : (
                            <ArrowRight className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Keyboard Navigation Footer */}
        <div className="px-4 py-2.5 border-t border-zinc-800/80 bg-[#0c0d12] flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                ↓
              </kbd>
              <span className="ml-0.5">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                ↵
              </kbd>
              <span className="ml-0.5">Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                Esc
              </kbd>
              <span className="ml-0.5">Close</span>
            </span>
          </div>
          <span className="hidden sm:inline text-zinc-600 font-mono text-[11px]">
            Track & Save Global Search
          </span>
        </div>
      </div>
    </div>
  );
}
