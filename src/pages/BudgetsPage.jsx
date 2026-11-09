import { useState } from 'react';
import {
  Wallet,
  Plus,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Pencil,
  Trash2,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import BudgetModal from '../components/budgets/BudgetModal';
import DeleteBudgetModal from '../components/budgets/DeleteBudgetModal';
import { useBudgets } from '../hooks/useBudgets';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency } from '../lib/formatters';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { getCurrentMonthKey } from '../lib/utils';

export default function BudgetsPage() {
  const { currency } = useApp();
  const toast = useToast();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);

  // Fetch transactions to calculate real category spend
  const { transactions } = useTransactions();
  const {
    budgetStats,
    totals,
    loading,
    error,
    saveBudget,
    removeBudget,
  } = useBudgets(selectedMonth, transactions);

  const handleOpenAddModal = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (data) => {
    try {
      await saveBudget(data);
      toast.success(editingBudget ? 'Budget limit updated successfully' : 'Budget created successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to save budget');
      throw err;
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await removeBudget(id);
      toast.success('Budget deleted successfully');
      setDeletingBudget(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete budget');
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monthly Budgets</h2>
          <p className="text-sm text-gray-500 mt-1">
            Set category limits, monitor real-time spending, and prevent budget overflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm text-gray-700 bg-transparent border-none outline-none cursor-pointer font-medium"
            />
          </div>

          <Button icon={Plus} onClick={handleOpenAddModal}>
            Create Budget
          </Button>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Total Budget
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(totals.totalBudgeted, currency)}
          </p>
          <div className="mt-3">
            <ProgressBar value={totals.totalSpent} max={totals.totalBudgeted} size="sm" />
            <p className="text-xs text-gray-400 mt-1.5">
              {totals.overallPercentage.toFixed(1)}% of budget used
            </p>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Total Spent So Far
          </p>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {formatCurrency(totals.totalSpent, currency)}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            <span>Across {budgetStats.length} active categories</span>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Remaining Budget
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {formatCurrency(totals.totalRemaining, currency)}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Available to spend safely</span>
          </div>
        </Card>
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <Spinner size="md" />
          <p className="text-xs text-gray-400 mt-2">Loading category budgets...</p>
        </div>
      ) : error ? (
        <Card className="text-center p-8 text-rose-600 text-sm">
          {error}
        </Card>
      ) : budgetStats.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wallet}
            title="No budgets configured for this month"
            description="Create your first budget limit to begin tracking category expenses."
            action={
              <Button icon={Plus} onClick={handleOpenAddModal}>
                Create Budget
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetStats.map((item) => (
            <Card key={item.id} className="relative group overflow-hidden flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.categoryColor }}
                    />
                    <h3 className="font-semibold text-gray-900 text-base">
                      {item.categoryLabel}
                    </h3>
                  </div>

                  {item.isExceeded ? (
                    <Badge color="red" className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Over Budget
                    </Badge>
                  ) : item.isNearLimit ? (
                    <Badge color="amber" className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Near Limit
                    </Badge>
                  ) : (
                    <Badge color="green">On Track</Badge>
                  )}
                </div>

                {/* Progress Details */}
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-bold text-gray-900">
                      {formatCurrency(item.spent, currency)}
                    </span>
                    <span className="text-xs text-gray-400">
                      Limit: {formatCurrency(item.limit, currency)}
                    </span>
                  </div>

                  <ProgressBar
                    value={item.spent}
                    max={item.limit}
                    size="md"
                  />

                  <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                    <span>{item.percentage.toFixed(0)}% consumed</span>
                    <span className={item.isExceeded ? 'text-rose-600 font-semibold' : ''}>
                      {item.isExceeded
                        ? `Over by ${formatCurrency(item.spent - item.limit, currency)}`
                        : `${formatCurrency(item.remaining, currency)} left`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-xs font-medium inline-flex items-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setDeletingBudget(item)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs font-medium inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveBudget}
        budget={editingBudget}
        defaultMonth={selectedMonth}
      />

      <DeleteBudgetModal
        isOpen={Boolean(deletingBudget)}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDeleteBudget}
        budget={deletingBudget}
      />
    </div>
  );
}
