import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { savingsService } from '../services/savingsService';

export function useSavings() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load goals from Supabase
  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await savingsService.getGoals(user.id);
      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching savings goals:', err);
      setError(err.message || 'Failed to load savings goals.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Create Goal via Supabase
  const addGoal = useCallback(
    async (goalData) => {
      if (!user) throw new Error('User not authenticated.');
      const created = await savingsService.createGoal(user.id, goalData);
      setGoals((prev) => [...prev, created]);
      return created;
    },
    [user]
  );

  // Edit Goal via Supabase
  const editGoal = useCallback(
    async (id, updates) => {
      if (!user) throw new Error('User not authenticated.');
      const updated = await savingsService.updateGoal(id, updates);
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      return updated;
    },
    [user]
  );

  // Delete Goal via Supabase
  const removeGoal = useCallback(
    async (id) => {
      if (!user) throw new Error('User not authenticated.');
      await savingsService.deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      return true;
    },
    [user]
  );

  // Deposit contribution towards goal via Supabase
  const depositToGoal = useCallback(
    async (goalId, contribution) => {
      if (!user) throw new Error('User not authenticated.');
      await savingsService.addContribution(user.id, goalId, contribution);
      await fetchGoals();
      return true;
    },
    [user, fetchGoals]
  );

  // Summary Metrics
  const totals = useMemo(() => {
    let totalTarget = 0;
    let totalSaved = 0;
    let completedCount = 0;

    for (const g of goals) {
      const target = Number(g.target_amount || 0);
      const current = Number(g.current_amount || 0);
      totalTarget += target;
      totalSaved += current;
      if (target > 0 && current >= target) {
        completedCount++;
      }
    }

    const overallPercentage = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return {
      totalTarget,
      totalSaved,
      totalRemaining: Math.max(0, totalTarget - totalSaved),
      overallPercentage,
      totalGoals: goals.length,
      completedCount,
    };
  }, [goals]);

  return {
    goals,
    loading,
    error,
    totals,
    addGoal,
    editGoal,
    removeGoal,
    depositToGoal,
    refetch: fetchGoals,
  };
}
