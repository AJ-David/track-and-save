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
  const { currency, isConverted, convertToBase, baseCurrency } = useApp();
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
      const depositInBase = isConverted && convertToBase ? convertToBase(depositAmount) : depositAmount;
      await onSubmit(goal.id, {
        amount: Number(depositInBase.toFixed(2)),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="bg-[#12131a] rounded-2xl shadow-2xl border border-zinc-800 w-full max-w-md overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/60 text-red-400 border border-red-800/40 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Add Contribution</h3>
              <p className="text-xs text-zinc-400">Deposit towards {goal.name}</p>
            </div>
          </div>
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

          {/* Goal Overview Mini Card */}
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-500 block">Current Progress</span>
              <span className="font-bold text-white">
                {formatCurrency(goal.current_amount, currency)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 block">Remaining to Target</span>
              <span className="font-bold text-emerald-400">
                {formatCurrency(remaining, currency)}
              </span>
            </div>
          </div>

          {/* Deposit Amount */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Deposit Amount ({currency})
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
                autoFocus
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

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Deposit Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:bg-[#1b1c29] focus:ring-2 focus:ring-red-600 outline-none text-zinc-200 cursor-pointer"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. End of month allocation"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:bg-[#1b1c29] focus:ring-2 focus:ring-red-600 outline-none text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
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

