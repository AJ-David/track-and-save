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
  const { currency } = useApp();
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
      setAmount(transaction.amount?.toString() || '');
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
  }, [transaction, isOpen]);

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
      await onSubmit({
        type,
        description: description.trim(),
        amount: numAmount,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Type Toggle Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange(TRANSACTION_TYPES.EXPENSE)}
              className={cn(
                'flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all',
                type === TRANSACTION_TYPES.EXPENSE
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
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
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <ArrowDownLeft className="w-4 h-4" />
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base">
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
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Grocery Restock"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Category & Payment Method in grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
              >
                {PAYMENT_METHODS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className={type === TRANSACTION_TYPES.EXPENSE ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500' : ''}
            >
              {transaction ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

