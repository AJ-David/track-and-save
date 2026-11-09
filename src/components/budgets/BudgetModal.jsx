import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import { EXPENSE_CATEGORIES } from '../../lib/constants';
import { useApp } from '../../contexts/AppContext';
import { CURRENCIES } from '../../lib/constants';
import { getCurrentMonthKey } from '../../lib/utils';

export default function BudgetModal({
  isOpen,
  onClose,
  onSubmit,
  budget = null, // If editing
  defaultMonth = getCurrentMonthKey(),
}) {
  const { currency } = useApp();
  const currencySymbol = CURRENCIES[currency]?.symbol || '₦';

  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [limitAmount, setLimitAmount] = useState('');
  const [month, setMonth] = useState(defaultMonth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (budget) {
      setCategory(budget.category || EXPENSE_CATEGORIES[0].id);
      setLimitAmount(budget.limit_amount?.toString() || budget.limit?.toString() || '');
      setMonth(budget.month || defaultMonth);
    } else {
      setCategory(EXPENSE_CATEGORIES[0].id);
      setLimitAmount('');
      setMonth(defaultMonth);
    }
    setError('');
  }, [budget, defaultMonth, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const limit = parseFloat(limitAmount);
    if (isNaN(limit) || limit <= 0) {
      setError('Please provide a valid spending limit greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        id: budget?.id,
        category,
        limit_amount: limit,
        month,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save budget.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {budget ? 'Edit Budget' : 'Set Category Budget'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={Boolean(budget)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 disabled:opacity-60"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Spending Limit */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Monthly Limit ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="50,000"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Month */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Month Period
            </label>
            <input
              type="month"
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {budget ? 'Save Budget' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

