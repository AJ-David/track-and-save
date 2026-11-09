import { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';
import Button from '../ui/Button';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
} from '../../lib/constants';
import { useApp } from '../../contexts/AppContext';
import { CURRENCIES } from '../../lib/constants';
import { cn } from '../../lib/utils';

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  transaction = null, // If provided, we are editing
}) {
  const { currency, isConverted, convertFromBase, convertToBase, baseCurrency } = useApp();
  const currencySymbol = CURRENCIES[currency]?.symbol || '₦';

  const [type, setType] = useState(TRANSACTION_TYPES.EXPENSE);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('debit_card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill fields when editing
  useEffect(() => {
    if (transaction) {
      setType(transaction.type || TRANSACTION_TYPES.EXPENSE);
      setDescription(transaction.description || '');
      const displayAmount = isConverted && convertFromBase
        ? convertFromBase(transaction.amount)
        : transaction.amount;
      setAmount(displayAmount !== undefined && displayAmount !== null ? Number(displayAmount.toFixed(2)).toString() : '');
      setCategory(transaction.category || '');
      setDate(transaction.date || new Date().toISOString().split('T')[0]);
      setPaymentMethod(transaction.payment_method || 'debit_card');
    } else {
      setType(TRANSACTION_TYPES.EXPENSE);
      setDescription('');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0].id);
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('debit_card');
    }
    setError('');
  }, [transaction, isOpen, isConverted, convertFromBase]);

  // Adjust default category on type toggle
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === TRANSACTION_TYPES.INCOME) {
      setCategory(INCOME_CATEGORIES[0].id);
    } else {
      setCategory(EXPENSE_CATEGORIES[0].id);
    }
  };

  const categories =
    type === TRANSACTION_TYPES.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    setLoading(true);
    try {
      // If viewing in converted currency, convert back to user's base ledger currency
      const amountInBase = isConverted && convertToBase ? convertToBase(numAmount) : numAmount;

      await onSubmit({
        type,
        description: description.trim(),
        amount: Number(amountInBase.toFixed(2)),
        category,
        date,
        payment_method: paymentMethod,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="bg-[#12131a] rounded-2xl shadow-2xl border border-zinc-800 w-full max-w-lg overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h3 className="text-lg font-black text-white">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 text-red-300 text-xs rounded-xl border border-red-800/60">
              {error}
            </div>
          )}

          {/* Type Toggle Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange(TRANSACTION_TYPES.EXPENSE)}
              className={cn(
                'flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all',
                type === TRANSACTION_TYPES.EXPENSE
                  ? 'bg-zinc-800 text-red-400 shadow-md'
                  : 'text-zinc-500 hover:text-zinc-200'
              )}
            >
              <ArrowUpRight className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange(TRANSACTION_TYPES.INCOME)}
              className={cn(
                'flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all',
                type === TRANSACTION_TYPES.INCOME
                  ? 'bg-zinc-800 text-emerald-400 shadow-md'
                  : 'text-zinc-500 hover:text-zinc-200'
              )}
            >
              <ArrowDownLeft className="w-4 h-4" />
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-base">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#161722] border border-zinc-800 rounded-xl text-base font-bold text-white focus:bg-[#1b1c29] focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>
            {isConverted && amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center justify-between font-mono">
                <span>
                  ≈ {CURRENCIES[baseCurrency]?.symbol}
                  {Number(convertToBase(parseFloat(amount))).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {baseCurrency} (base ledger)
                </span>
                <span className="text-red-400">Official rate</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Grocery Restock"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:bg-[#1b1c29] focus:ring-2 focus:ring-red-600 outline-none text-zinc-100 placeholder-zinc-500"
            />
          </div>

          {/* Category & Payment Method in grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:bg-[#1b1c29] focus:ring-2 focus:ring-red-600 outline-none text-zinc-200 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#12131a] text-zinc-200">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:bg-[#1b1c29] focus:ring-2 focus:ring-red-600 outline-none text-zinc-200 cursor-pointer"
              >
                {PAYMENT_METHODS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#12131a] text-zinc-200">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:bg-[#1b1c29] focus:ring-2 focus:ring-red-600 outline-none text-zinc-200 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className={type === TRANSACTION_TYPES.EXPENSE ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-md shadow-red-950/80' : ''}
            >
              {transaction ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

