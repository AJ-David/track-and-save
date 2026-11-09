import { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import Button from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import { CURRENCIES } from '../../lib/constants';

const GOAL_COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

export default function SavingsGoalModal({
  isOpen,
  onClose,
  onSubmit,
  goal = null, // If editing
}) {
  const { currency } = useApp();
  const currencySymbol = CURRENCIES[currency]?.symbol || '₦';

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (goal) {
      setName(goal.name || '');
      setTargetAmount(goal.target_amount?.toString() || '');
      setCurrentAmount(goal.current_amount?.toString() || '0');
      setDeadline(goal.deadline ? goal.deadline.split('T')[0] : '');
      setColor(goal.color || GOAL_COLORS[0]);
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      // Default deadline: 6 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setDeadline(d.toISOString().split('T')[0]);
      setColor(GOAL_COLORS[0]);
    }
    setError('');
  }, [goal, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a goal name.');
      return;
    }

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setError('Please provide a valid target amount greater than 0.');
      return;
    }

    const current = currentAmount ? parseFloat(currentAmount) : 0;
    if (isNaN(current) || current < 0) {
      setError('Current amount must be a positive number.');
      return;
    }

    if (!deadline) {
      setError('Please set a target date.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        id: goal?.id,
        name: name.trim(),
        target_amount: target,
        current_amount: current,
        deadline,
        color,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save savings goal.');
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
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-inner"
              style={{ backgroundColor: `${color}25` }}
            >
              <Target className="w-4 h-4" style={{ color }} />
            </div>
            <h3 className="text-lg font-black text-white">
              {goal ? 'Edit Savings Goal' : 'New Savings Goal'}
            </h3>
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

          {/* Goal Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Goal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Emergency Fund or New Car"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:bg-[#1b1c29] focus:ring-2 focus:ring-red-600 outline-none text-zinc-100 placeholder-zinc-500"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Target Amount ({currency})
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
                placeholder="1,000,000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#161722] border border-zinc-800 rounded-xl text-base font-bold text-white focus:bg-[#1b1c29] focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>
          </div>

          {/* Current / Starting Amount */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Current Saved Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-base">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm font-bold text-white focus:bg-[#1b1c29] focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>
          </div>

          {/* Target Deadline */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Target Date / Deadline
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:bg-[#1b1c29] focus:ring-2 focus:ring-red-600 outline-none text-zinc-200 cursor-pointer"
            />
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Goal Theme Color
            </label>
            <div className="flex items-center gap-3">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px #090a0f, 0 0 0 4px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {goal ? 'Save Goal' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

