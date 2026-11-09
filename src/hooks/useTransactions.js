import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { transactionService } from '../services/transactionService';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load transactions from Supabase
  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await transactionService.getTransactions(user.id);
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Create Transaction
  const addTransaction = useCallback(
    async (transactionData) => {
      if (!user) throw new Error('User not authenticated.');
      const created = await transactionService.createTransaction(user.id, transactionData);
      setTransactions((prev) => [created, ...prev]);
      return created;
    },
    [user]
  );

  // Update Transaction
  const editTransaction = useCallback(
    async (id, updates) => {
      if (!user) throw new Error('User not authenticated.');
      const updated = await transactionService.updateTransaction(id, updates);
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    },
    [user]
  );

  // Delete Transaction
  const removeTransaction = useCallback(
    async (id) => {
      if (!user) throw new Error('User not authenticated.');
      await transactionService.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return true;
    },
    [user]
  );

  // Overall summary
  const summary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const t of transactions) {
      if (t.type === 'income') income += Number(t.amount || 0);
      if (t.type === 'expense') expenses += Number(t.amount || 0);
    }
    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    editTransaction,
    removeTransaction,
    refetch: fetchTransactions,
    summary,
  };
}
