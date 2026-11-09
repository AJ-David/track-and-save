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
  const { currency, isConverted, convertFromBase, convertToBase, baseCurrency } = useApp();
  const currencySymbol = CURRENCIES[currency]?.symbol || '₦';

  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [limitAmount, setLimitAmount] = useState('');
  const [month, setMonth] = useState(defaultMonth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (budget) {
      setCategory(budget.category || EXPENSE_CATEGORIES[0].id);
      const rawLimit = budget.limit_amount ?? budget.limit;
      const displayLimit = isConverted && convertFromBase ? convertFromBase(rawLimit) : rawLimit;
      setLimitAmount(displayLimit !== undefined && displayLimit !== null ? Number(displayLimit.toFixed(2)).toString() : '');
      setMonth(budget.month || defaultMonth);
    } else {
      setCategory(EXPENSE_CATEGORIES[0].id);
      setLimitAmount('');
      setMonth(defaultMonth);
    }
    setError('');
  }, [budget, defaultMonth, isOpen, isConverted, convertFromBase]);

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
      const limitInBase = isConverted && convertToBase ? convertToBase(limit) : limit;
      await onSubmit({
        id: budget?.id,
        category,
        limit_amount: Number(limitInBase.toFixed(2)),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="bg-[#12131a] rounded-2xl shadow-2xl border border-zinc-800 w-full max-w-md overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h3 className="text-lg font-black text-white">
            {budget ? 'Edit Budget' : 'Set Category Budget'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 text-red-300 text-xs rounded-xl border border-red-800/60">
              {error}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={Boolean(budget)}
              className="w-full px-3 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:bg-[#1b1c29] focus:ring-2 focus:ring-red-600 outline-none text-zinc-200 disabled:opacity-60 cursor-pointer"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#12131a] text-zinc-200">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Spending Limit */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Monthly Limit ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-base">
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
                className="w-full pl-9 pr-4 py-2.5 bg-[#161722] border border-zinc-800 rounded-xl text-base font-bold text-white focus:bg-[#1b1c29] focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>
            {isConverted && limitAmount && !isNaN(parseFloat(limitAmount)) && parseFloat(limitAmount) > 0 && (
              <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center justify-between font-mono">
                <span>
                  ≈ {CURRENCIES[baseCurrency]?.symbol}
                  {Number(convertToBase(parseFloat(limitAmount))).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {baseCurrency} (base ledger)
                </span>
                <span className="text-red-400">Official rate</span>
              </p>
            )}
          </div>

          {/* Month */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Month Period
            </label>
            <input
              type="month"
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:bg-[#1b1c29] focus:ring-2 focus:ring-red-600 outline-none text-zinc-200 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
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

