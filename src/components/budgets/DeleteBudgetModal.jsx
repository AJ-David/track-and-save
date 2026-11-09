import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

export default function DeleteBudgetModal({
  isOpen,
  onClose,
  onConfirm,
  budget,
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !budget) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(budget.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete budget:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="bg-[#12131a] rounded-2xl shadow-2xl border border-zinc-800 w-full max-w-md p-6 overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-950/60 text-red-400 border border-red-800/40 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Delete Budget</h3>
            <p className="text-xs text-zinc-500">Remove spending limit for this category.</p>
          </div>
        </div>

        <p className="text-sm text-zinc-300 mb-4 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
          Are you sure you want to delete the budget for{' '}
          <strong className="text-white">
            &quot;{budget.categoryLabel || budget.category}&quot;
          </strong>
          ?
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={loading}
            onClick={handleDelete}
          >
            Delete Budget
          </Button>
        </div>
      </div>
    </div>
  );
}

