import Card, { CardHeader, CardTitle } from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import { EXPENSE_CATEGORIES } from '../../lib/constants';
import { formatCurrency } from '../../lib/formatters';
import { useApp } from '../../contexts/AppContext';
import { Link } from 'react-router-dom';

function getCategoryLabel(id) {
  return EXPENSE_CATEGORIES.find((c) => c.id === id)?.label || id;
}

export default function BudgetOverview({ budgets = [], transactions = [] }) {
  const { currency } = useApp();

  // Calculate spent per budget category from transactions
  const budgetItems = (budgets || []).map((budget) => {
    const limit = Number(budget.limit_amount ?? budget.limit ?? 0);
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    return { ...budget, limit, spent, percentage };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
        <Link
          to="/budgets"
          className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
        >
          Manage
        </Link>
      </CardHeader>

      {budgetItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400">
          No active budgets set for this month.{' '}
          <Link to="/budgets" className="text-emerald-600 underline font-medium">
            Set a budget
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {budgetItems.map((item) => (
            <div key={item.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">
                  {getCategoryLabel(item.category)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatCurrency(item.spent, currency)}{' '}
                  <span className="text-gray-300">/</span>{' '}
                  {formatCurrency(item.limit, currency)}
                </span>
              </div>
              <ProgressBar value={item.spent} max={item.limit} size="md" />
              {item.percentage >= 90 && (
                <p className="text-xs text-rose-500 mt-1 font-semibold">
                  ⚠ {item.percentage >= 100 ? 'Over budget!' : 'Approaching spending limit'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
