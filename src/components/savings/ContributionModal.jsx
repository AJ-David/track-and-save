import { useState } from 'react';
import { X, PiggyBank, ArrowDownLeft } from 'lucide-react';
import Button from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import { CURRENCIES } from '../../lib/constants';
import { formatCurrency } from '../../lib/formatters';

export default function ContributionModal({
  isOpen,
  onClose,
  onSubmit,
  goal,
}) {
  const { currency } = useApp();
  const currencySymbol = CURRENCIES[currency]?.symbol || '₦';

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.target_amount - goal.current_amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError('Please provide a valid deposit amount greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(goal.id, {
        amount: depositAmount,
        date,
        notes,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record contribution.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Add Contribution</h3>
              <p className="text-xs text-gray-500">Deposit towards {goal.name}</p>
            </div>
          </div>
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

          {/* Goal Overview Mini Card */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-400 block">Current Progress</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(goal.current_amount, currency)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block">Remaining to Target</span>
              <span className="font-bold text-emerald-600">
                {formatCurrency(remaining, currency)}
              </span>
            </div>
          </div>

          {/* Deposit Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Deposit Amount ({currency})
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
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Deposit Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. End of month allocation"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} icon={ArrowDownLeft}>
              Deposit Funds
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

