import Card, { CardHeader, CardTitle } from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import { formatCurrency } from '../../lib/formatters';
import { useApp } from '../../contexts/AppContext';
import { Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SavingsOverview({ goals }) {
  const { currency } = useApp();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Goals</CardTitle>
        <Link
          to="/savings"
          className="text-xs text-red-500 font-bold hover:text-red-400 uppercase tracking-wider transition-colors"
        >
          View all
        </Link>
      </CardHeader>

      <div className="space-y-4">
        {goals.map((goal) => {
          const remaining = goal.target_amount - goal.current_amount;
          const percentage = (goal.current_amount / goal.target_amount) * 100;

          return (
            <div
              key={goal.id}
              className="p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: `${goal.color}25` }}
                >
                  <Target className="w-4 h-4" style={{ color: goal.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-100 truncate">{goal.name}</p>
                  <p className="text-xs text-zinc-500">
                    Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs font-bold text-zinc-300">
                  {percentage.toFixed(0)}%
                </span>
              </div>
              <ProgressBar value={goal.current_amount} max={goal.target_amount} size="sm" color="red" />
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-zinc-400">
                  {formatCurrency(goal.current_amount, currency)} saved
                </span>
                <span className="text-xs text-zinc-500">
                  {formatCurrency(remaining, currency)} remaining
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

