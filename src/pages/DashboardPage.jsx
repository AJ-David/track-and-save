import { useState, useMemo } from 'react';
import { Calendar, Plus } from 'lucide-react';
import StatCards from '../components/dashboard/StatCards';
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import BudgetOverview from '../components/dashboard/BudgetOverview';
import SavingsOverview from '../components/dashboard/SavingsOverview';
import NotificationBanner from '../components/dashboard/NotificationBanner';
import TransactionModal from '../components/transactions/TransactionModal';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';
import { useSavings } from '../hooks/useSavings';
import { useApp } from '../contexts/AppContext';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { convertFromBase } = useApp();
  const [dateRange, setDateRange] = useState('this-month');
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);

  // Live transactions, budgets & savings
  const { transactions, addTransaction } = useTransactions();
  const { budgets } = useBudgets(undefined, transactions);
  const { goals, totals: savingsTotals } = useSavings();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const firstName = displayName.split(' ')[0] || 'User';

  // Filter transactions dynamically by the selected dateRange
  const filteredDashboardTxns = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    switch (dateRange) {
      case 'this-week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactions.filter((t) => new Date(t.date) >= weekAgo);
      }
      case 'this-month': {
        const monthStart = new Date(currentYear, currentMonth, 1);
        return transactions.filter((t) => new Date(t.date) >= monthStart);
      }
      case 'last-month': {
        const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const lastMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
        return transactions.filter((t) => {
          const d = new Date(t.date);
          return d >= lastMonthStart && d <= lastMonthEnd;
        });
      }
      case 'last-3-months': {
        const threeMonthsAgo = new Date(currentYear, currentMonth - 2, 1);
        return transactions.filter((t) => new Date(t.date) >= threeMonthsAgo);
      }
      case 'this-year': {
        const yearStart = new Date(currentYear, 0, 1);
        return transactions.filter((t) => new Date(t.date) >= yearStart);
      }
      default:
        return transactions;
    }
  }, [transactions, dateRange]);

  // Aggregate summary based on filtered transactions
  const dashboardSummary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const t of filteredDashboardTxns) {
      if (t.type === 'income') income += Number(t.amount || 0);
      if (t.type === 'expense') expenses += Number(t.amount || 0);
    }

    return {
      income,
      expenses,
      balance: income - expenses,
      savings: savingsTotals.totalSaved,
    };
  }, [filteredDashboardTxns, savingsTotals]);

  // Live category breakdown from filtered transactions
  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredDashboardTxns
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + Number(t.amount);
      });
    return Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
    }));
  }, [filteredDashboardTxns]);

  // Dynamic monthly trend data for the area chart
  const dynamicMonthlyTrends = useMemo(() => {
    const now = new Date();
    const months = [];

    // Last 6 calendar months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short' });
      months.push({ key, month: label, income: 0, expenses: 0 });
    }

    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = months.find((m) => m.key === key);
      if (entry) {
        const amt = convertFromBase ? convertFromBase(t.amount || 0) : Number(t.amount || 0);
        if (t.type === 'income') entry.income += amt;
        else entry.expenses += amt;
      }
    });

    return months;
  }, [transactions, convertFromBase]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Welcome back, <span className="text-red-500">{firstName}</span> 👋
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Here&apos;s your financial pulse and monthly overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-[#12131a] border border-zinc-800 rounded-xl px-3 py-2 shadow-md">
            <Calendar className="w-4 h-4 text-red-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm font-semibold text-zinc-200 bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="this-week" className="bg-[#12131a] text-zinc-200">This Week</option>
              <option value="this-month" className="bg-[#12131a] text-zinc-200">This Month</option>
              <option value="last-month" className="bg-[#12131a] text-zinc-200">Last Month</option>
              <option value="last-3-months" className="bg-[#12131a] text-zinc-200">Last 3 Months</option>
              <option value="this-year" className="bg-[#12131a] text-zinc-200">This Year</option>
            </select>
          </div>

          {/* Quick Add Action */}
          <Button icon={Plus} onClick={() => setIsTxnModalOpen(true)}>
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Notification Alert Bar */}
      <NotificationBanner budgets={budgets} transactions={filteredDashboardTxns} />

      {/* Stat Cards (Dynamically recalculate based on selected period) */}
      <StatCards summary={dashboardSummary} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeExpenseChart data={dynamicMonthlyTrends} />
        </div>
        <div>
          <CategoryBreakdown data={categoryBreakdown} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={filteredDashboardTxns} />
        </div>
        <div className="space-y-6">
          <BudgetOverview budgets={budgets} transactions={filteredDashboardTxns} />
          <SavingsOverview goals={goals} />
        </div>
      </div>

      {/* Quick Add Modal */}
      <TransactionModal
        isOpen={isTxnModalOpen}
        onClose={() => setIsTxnModalOpen(false)}
        onSubmit={addTransaction}
      />
    </div>
  );
}
