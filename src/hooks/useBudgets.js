import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { budgetService } from '../services/budgetService';
import { getCurrentMonthKey } from '../lib/utils';
import { EXPENSE_CATEGORIES } from '../lib/constants';

export function useBudgets(selectedMonth = getCurrentMonthKey(), transactions = []) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudgets = useCallback(async () => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await budgetService.getBudgets(user.id, selectedMonth);
      setBudgets(data || []);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError(err.message || 'Failed to load budgets.');
    } finally {
      setLoading(false);
    }
  }, [user, selectedMonth]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Save (Create or Update via Supabase)
  const saveBudget = useCallback(
    async (budgetData) => {
      if (!user) throw new Error('User not authenticated.');
      const limitAmount = parseFloat(budgetData.limit_amount);
      const targetMonth = budgetData.month || selectedMonth;

      const saved = await budgetService.upsertBudget(user.id, {
        ...budgetData,
        month: targetMonth,
        limit_amount: limitAmount,
      });

      await fetchBudgets();
      return saved;
    },
    [user, selectedMonth, fetchBudgets]
  );

  // Delete via Supabase
  const removeBudget = useCallback(
    async (id) => {
      if (!user) throw new Error('User not authenticated.');
      await budgetService.deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      return true;
    },
    [user]
  );

  // Enhanced budgets with spent calculation from real transactions
  const budgetStats = useMemo(() => {
    return budgets.map((b) => {
      const limit = Number(b.limit_amount ?? b.limit ?? 0);
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.category === b.category)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const remaining = Math.max(0, limit - spent);
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      const categoryInfo = EXPENSE_CATEGORIES.find((c) => c.id === b.category);

      return {
        ...b,
        limit,
        spent,
        remaining,
        percentage,
        isExceeded: spent > limit,
        isNearLimit: percentage >= 85 && spent <= limit,
        categoryLabel: categoryInfo?.label || b.category,
        categoryColor: categoryInfo?.color || '#94a3b8',
      };
    });
  }, [budgets, transactions]);

  // Overall totals
  const totals = useMemo(() => {
    const totalBudgeted = budgetStats.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgetStats.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
    const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    return {
      totalBudgeted,
      totalSpent,
      totalRemaining,
      overallPercentage,
    };
  }, [budgetStats]);

  return {
    budgets,
    budgetStats,
    totals,
    loading,
    error,
    saveBudget,
    removeBudget,
    refetch: fetchBudgets,
  };
}
