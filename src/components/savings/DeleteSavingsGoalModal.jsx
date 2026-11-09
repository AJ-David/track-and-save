import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

export default function DeleteSavingsGoalModal({
  isOpen,
  onClose,
  onConfirm,
  goal,
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !goal) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(goal.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Delete Savings Goal</h3>
            <p className="text-xs text-gray-500">This will also delete recorded contributions.</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
          Are you sure you want to delete the goal{' '}
          <strong className="text-gray-900">&quot;{goal.name}&quot;</strong>?
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
            Delete Goal
          </Button>
        </div>
      </div>
    </div>
  );
}

