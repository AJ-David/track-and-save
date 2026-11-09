import { useState } from 'react';
import {
  PiggyBank,
  Plus,
  Target,
  Calendar,
  CheckCircle,
  TrendingUp,
  Pencil,
  Trash2,
  Clock,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import SavingsGoalModal from '../components/savings/SavingsGoalModal';
import ContributionModal from '../components/savings/ContributionModal';
import DeleteSavingsGoalModal from '../components/savings/DeleteSavingsGoalModal';
import { useSavings } from '../hooks/useSavings';
import { formatCurrency, formatDate } from '../lib/formatters';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

export default function SavingsPage() {
  const { currency } = useApp();
  const toast = useToast();
  const {
    goals,
    loading,
    error,
    totals,
    addGoal,
    editGoal,
    removeGoal,
    depositToGoal,
  } = useSavings();

  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributingGoal, setContributingGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);

  const handleOpenAddModal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleOpenEditModal = (goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (data) => {
    try {
      if (editingGoal) {
        await editGoal(editingGoal.id, data);
        toast.success('Savings goal updated successfully');
      } else {
        await addGoal(data);
        toast.success('Savings goal created successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save savings goal');
      throw err;
    }
  };

  const handleDepositToGoal = async (goalId, data) => {
    try {
      await depositToGoal(goalId, data);
      toast.success('Contribution added! Great progress!');
      setContributingGoal(null);
    } catch (err) {
      toast.error(err.message || 'Failed to add funds');
      throw err;
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await removeGoal(id);
      toast.success('Savings goal deleted successfully');
      setDeletingGoal(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete goal');
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Savings Goals</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Build wealth, set target deadlines, and fund your financial milestones.
          </p>
        </div>
        <Button icon={Plus} onClick={handleOpenAddModal}>
          New Savings Goal
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Total Savings Target
          </p>
          <p className="text-2xl font-black text-white mt-1 tracking-tight">
            {formatCurrency(totals.totalTarget, currency)}
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            Target across {totals.totalGoals} active goal{totals.totalGoals === 1 ? '' : 's'}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Total Funded
          </p>
          <p className="text-2xl font-black text-emerald-400 mt-1 tracking-tight">
            {formatCurrency(totals.totalSaved, currency)}
          </p>
          <div className="mt-3">
            <ProgressBar value={totals.totalSaved} max={totals.totalTarget} size="sm" />
            <p className="text-xs text-zinc-500 mt-1.5">
              {totals.overallPercentage.toFixed(1)}% of total target achieved
            </p>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Remaining to Save
          </p>
          <p className="text-2xl font-black text-amber-400 mt-1 tracking-tight">
            {formatCurrency(totals.totalRemaining, currency)}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {totals.completedCount} completed · {totals.activeCount} in progress
            </span>
          </div>
        </Card>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <Spinner size="md" />
          <p className="text-xs text-gray-400 mt-2">Loading savings goals...</p>
        </div>
      ) : error ? (
        <Card className="text-center p-8 text-rose-600 text-sm">
          {error}
        </Card>
      ) : goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={PiggyBank}
            title="No savings goals yet"
            description="Create your first goal to set a target amount, deadline, and start depositing."
            action={
              <Button icon={Plus} onClick={handleOpenAddModal}>
                Create Goal
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const target = Number(goal.target_amount || 0);
            const current = Number(goal.current_amount || 0);
            const remaining = Math.max(0, target - current);
            const percentage = target > 0 ? (current / target) * 100 : 0;
            const isCompleted = current >= target;

            // Calculate days remaining
            const targetDate = new Date(goal.deadline);
            const today = new Date();
            const diffTime = targetDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return (
              <Card key={goal.id} className="flex flex-col justify-between group overflow-hidden">
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${goal.color}18` }}
                    >
                      <Target className="w-6 h-6" style={{ color: goal.color }} />
                    </div>

                    <div className="flex items-center gap-1">
                      {isCompleted ? (
                        <Badge color="green" className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Target Reached
                        </Badge>
                      ) : (
                        <Badge color="blue">{percentage.toFixed(0)}% funded</Badge>
                      )}
                    </div>
                  </div>

                  {/* Goal Name & Deadline */}
                  <h3 className="font-bold text-white text-lg mb-1">{goal.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Target: {formatDate(goal.deadline, 'medium')}</span>
                    {!isCompleted && diffDays > 0 && (
                      <span className="text-zinc-600">· {diffDays} days left</span>
                    )}
                  </div>

                  {/* Progress Bar & Amounts */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-base font-bold text-white">
                        {formatCurrency(current, currency)}
                      </span>
                      <span className="text-xs text-zinc-500">
                        Goal: {formatCurrency(target, currency)}
                      </span>
                    </div>

                    <ProgressBar value={current} max={target} size="md" />

                    <div className="flex justify-between text-xs text-zinc-400 pt-1">
                      <span>{percentage.toFixed(1)}% achieved</span>
                      <span className={isCompleted ? 'text-emerald-400 font-bold' : ''}>
                        {isCompleted
                          ? 'Goal Completed! 🎉'
                          : `${formatCurrency(remaining, currency)} remaining`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-zinc-800 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setContributingGoal(goal)}
                  >
                    + Add Funds
                  </Button>
                  <button
                    onClick={() => handleOpenEditModal(goal)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors"
                    title="Edit Goal"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingGoal(goal)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleSaveGoal}
        goal={editingGoal}
      />

      <ContributionModal
        isOpen={Boolean(contributingGoal)}
        onClose={() => setContributingGoal(null)}
        onSubmit={handleDepositToGoal}
        goal={contributingGoal}
      />

      <DeleteSavingsGoalModal
        isOpen={Boolean(deletingGoal)}
        onClose={() => setDeletingGoal(null)}
        onConfirm={handleDeleteGoal}
        goal={deletingGoal}
      />
    </div>
  );
}
