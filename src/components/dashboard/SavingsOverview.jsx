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
          className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
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
              className="p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${goal.color}15` }}
                >
                  <Target className="w-4 h-4" style={{ color: goal.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{goal.name}</p>
                  <p className="text-xs text-gray-400">
                    Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {percentage.toFixed(0)}%
                </span>
              </div>
              <ProgressBar value={goal.current_amount} max={goal.target_amount} size="sm" color="emerald" />
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-400">
                  {formatCurrency(goal.current_amount, currency)} saved
                </span>
                <span className="text-xs text-gray-400">
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

