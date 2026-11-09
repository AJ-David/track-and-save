import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import Card, { CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { useTransactions } from '../hooks/useTransactions';
import { useSavings } from '../hooks/useSavings';
import { formatCurrency } from '../lib/formatters';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { exportTransactionsToCSV } from '../lib/csvExport';
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../lib/constants';

function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#151620] rounded-xl shadow-2xl border border-zinc-700/80 p-3.5 text-xs">
      <p className="font-bold text-white mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="capitalize text-zinc-400 font-medium">{entry.name}:</span>
          </div>
          <span className="font-bold text-zinc-100">
            {formatCurrency(entry.value, currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { currency } = useApp();
  const toast = useToast();
  const { transactions, loading, error } = useTransactions();
  const { totals: savingsTotals } = useSavings();

  const [dateRange, setDateRange] = useState('6-months');
  const [exporting, setExporting] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  // Filter transactions by selected date range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let cutoff = new Date();

    switch (dateRange) {
      case '30-days':
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3-months':
        cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        break;
      case '6-months':
        cutoff = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
      case 'this-year':
        cutoff = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        cutoff = new Date(2000, 0, 1);
        break;
    }

    return transactions.filter((t) => new Date(t.date) >= cutoff);
  }, [transactions, dateRange]);

  // Aggregate dynamic chart trend data based on selected dateRange
  const monthlyTrendsData = useMemo(() => {
    if (dateRange === '30-days') {
      // Group by 4 distinct weekly periods for rich 30-day granularity
      const weeks = [
        { label: 'Week 1 (21-28d ago)', minDays: 21, maxDays: 30, income: 0, expenses: 0 },
        { label: 'Week 2 (14-20d ago)', minDays: 14, maxDays: 20, income: 0, expenses: 0 },
        { label: 'Week 3 (7-13d ago)', minDays: 7, maxDays: 13, income: 0, expenses: 0 },
        { label: 'Week 4 (Past 7d)', minDays: 0, maxDays: 6, income: 0, expenses: 0 },
      ];

      const now = new Date();
      filteredTransactions.forEach((t) => {
        const d = new Date(t.date);
        const daysDiff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        const amt = Number(t.amount || 0);

        for (const w of weeks) {
          if (daysDiff >= w.minDays && daysDiff <= w.maxDays) {
            if (t.type === 'income') w.income += amt;
            else w.expenses += amt;
            break;
          }
        }
      });

      return weeks.map((w) => ({
        month: w.label,
        income: w.income,
        expenses: w.expenses,
        savings: Math.max(0, w.income - w.expenses),
        net: w.income - w.expenses,
      }));
    }

    // Otherwise group by Month (YYYY-MM)
    const monthMap = {};

    filteredTransactions.forEach((t) => {
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      if (!monthMap[key]) {
        monthMap[key] = { key, month: label, income: 0, expenses: 0, date: d };
      }

      if (t.type === 'income') {
        monthMap[key].income += Number(t.amount || 0);
      } else {
        monthMap[key].expenses += Number(t.amount || 0);
      }
    });

    const sorted = Object.values(monthMap).sort((a, b) => a.date - b.date);

    return sorted.map((m) => ({
      ...m,
      savings: Math.max(0, m.income - m.expenses),
      net: m.income - m.expenses,
    }));
  }, [filteredTransactions, dateRange]);

  // Category-based expense breakdown
  const categoryStats = useMemo(() => {
    const map = {};
    let totalExpense = 0;

    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const amt = Number(t.amount || 0);
        totalExpense += amt;
        map[t.category] = (map[t.category] || 0) + amt;
      });

    return Object.entries(map)
      .map(([catId, amount]) => {
        const info = EXPENSE_CATEGORIES.find((c) => c.id === catId);
        return {
          id: catId,
          name: info?.label || catId,
          color: info?.color || '#94a3b8',
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Summary KPI Metrics
  const metrics = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let expenseTxnCount = 0;

    filteredTransactions.forEach((t) => {
      const amt = Number(t.amount || 0);
      if (t.type === 'income') {
        income += amt;
      } else {
        expenses += amt;
        expenseTxnCount++;
      }
    });

    const net = income - expenses;
    const savingsRate = income > 0 ? Math.max(0, (net / income) * 100) : 0;
    const avgExpense = expenseTxnCount > 0 ? expenses / expenseTxnCount : 0;

    return {
      income,
      expenses,
      net,
      savingsRate,
      avgExpense,
      topCategory: categoryStats[0]?.name || 'None',
    };
  }, [filteredTransactions, categoryStats]);

  // Handle CSV Export
  const handleExportCSV = () => {
    try {
      setExporting(true);
      exportTransactionsToCSV(filteredTransactions, currency);
      setExportedSuccess(true);
      toast.success(`Exported ${filteredTransactions.length} transactions to CSV`);
      setTimeout(() => setExportedSuccess(false), 3500);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export transactions to CSV');
    } finally {
      setExporting(false);
    }
  };

  const periodLabelMap = {
    '30-days': 'Last 30 Days',
    '3-months': 'Last 3 Months',
    '6-months': 'Last 6 Months',
    'this-year': 'This Year',
    'all': 'All Time',
  };

  return (
    <div className="space-y-6">
      {/* Header + Date Range & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Analytics &amp; Financial Reports</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Deep dive into your cashflow trajectory, category spending, and savings velocity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-[#12131a] border border-zinc-800 rounded-xl px-3 py-2 shadow-md">
            <Calendar className="w-4 h-4 text-red-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm font-semibold text-zinc-200 bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="30-days" className="bg-[#12131a] text-zinc-200">Last 30 Days (Weekly)</option>
              <option value="3-months" className="bg-[#12131a] text-zinc-200">Last 3 Months</option>
              <option value="6-months" className="bg-[#12131a] text-zinc-200">Last 6 Months</option>
              <option value="this-year" className="bg-[#12131a] text-zinc-200">This Year</option>
              <option value="all" className="bg-[#12131a] text-zinc-200">All Time</option>
            </select>
          </div>

          {/* Export CSV Button */}
          <Button
            variant="outline"
            icon={exportedSuccess ? Check : Download}
            loading={exporting}
            onClick={handleExportCSV}
            className={exportedSuccess ? 'text-emerald-400 border-emerald-800 bg-emerald-950/60' : ''}
          >
            {exportedSuccess ? 'Exported!' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Spinner size="lg" />
          <p className="text-sm text-zinc-500 mt-3">Compiling financial analytics...</p>
        </div>
      ) : error ? (
        <Card className="text-center p-8 text-red-400 text-sm">
          {error}
        </Card>
      ) : filteredTransactions.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileSpreadsheet}
            title="No transactions for selected period"
            description="Try selecting a wider date range or record transactions to generate insights."
          />
        </Card>
      ) : (
        <>
          {/* KPI Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Savings Rate
                  </p>
                  <p className="text-2xl font-black text-emerald-400 mt-1 tracking-tight">
                    {metrics.savingsRate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {periodLabelMap[dateRange]} retention rate
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Total Period Outflow
                  </p>
                  <p className="text-2xl font-black text-red-400 mt-1 tracking-tight">
                    {formatCurrency(metrics.expenses, currency)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Across {filteredTransactions.filter((t) => t.type === 'expense').length} expense entries
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Net Cash Balance
                  </p>
                  <p className="text-2xl font-black text-white mt-1 tracking-tight">
                    {formatCurrency(metrics.net, currency)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-100">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-2">Net cash inflow margin</p>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Top Spend Category
                  </p>
                  <p className="text-lg font-black text-white mt-1 truncate max-w-[140px]">
                    {metrics.topCategory}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
                  <PieIcon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-2">Highest cumulative outlay</p>
            </Card>
          </div>

          {/* Cashflow Comparison Bar Chart */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Cash Flow Trajectory (Income vs Expenses)</CardTitle>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Showing {periodLabelMap[dateRange]} comparison
                </p>
              </div>
            </CardHeader>
            <div className="h-[340px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#71717a' }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Row: Net Savings Curve + Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Net Savings Curve */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Net Cash Margin (Monthly Savings)</CardTitle>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Retained cashflow margin across {periodLabelMap[dateRange]}
                  </p>
                </div>
              </CardHeader>
              <div className="h-[300px] -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="netSavingsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#71717a' }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip currency={currency} />} />
                    <Area
                      type="monotone"
                      dataKey="net"
                      name="Net Savings"
                      stroke="#dc2626"
                      strokeWidth={2.5}
                      fill="url(#netSavingsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Category Expenses Breakdown */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Expenses by Category</CardTitle>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Distribution for {periodLabelMap[dateRange]}
                  </p>
                </div>
              </CardHeader>
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {categoryStats.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-8 text-center">No expense records found.</p>
                ) : (
                  categoryStats.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold text-zinc-200">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-100">
                            {formatCurrency(item.amount, currency)}
                          </span>
                          <span className="text-zinc-500 w-12 text-right">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
