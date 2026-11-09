import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, AlertCircle, ArrowRight, X } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import { useApp } from '../../contexts/AppContext';

export default function NotificationBanner({ budgets = [], transactions = [] }) {
  const { currency } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !budgets.length) return null;

  // Calculate real spending per budget category
  const budgetAlerts = budgets
    .map((b) => {
      const limit = Number(b.limit_amount ?? b.limit ?? 0);
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.category === b.category)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const isExceeded = limit > 0 && spent > limit;
      const isNearLimit = limit > 0 && !isExceeded && spent / limit >= 0.85;

      return {
        ...b,
        limit,
        spent,
        overAmount: spent - limit,
        percentage: limit > 0 ? (spent / limit) * 100 : 0,
        isExceeded,
        isNearLimit,
      };
    })
    .filter((b) => b.isExceeded || b.isNearLimit);

  if (!budgetAlerts.length) return null;

  // Prioritize exceeded alerts over near-limit alerts
  const primaryAlert = budgetAlerts.find((b) => b.isExceeded) || budgetAlerts[0];
  const isDanger = primaryAlert.isExceeded;

  const title = isDanger
    ? `Budget Exceeded: ${primaryAlert.category}`
    : `Approaching Budget Limit: ${primaryAlert.category}`;

  const message = isDanger
    ? `You have exceeded your monthly limit for ${primaryAlert.category} by ${formatCurrency(
        primaryAlert.overAmount,
        currency
      )}. Adjust your budget or cut back on expenses to stay on track.`
    : `${primaryAlert.category} spending has reached ${primaryAlert.percentage.toFixed(
        0
      )}% of your ${formatCurrency(primaryAlert.limit, currency)} monthly allowance.`;

  return (
    <div
      className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border shadow-sm transition-all duration-200 ${
        isDanger
          ? 'bg-rose-50/90 border-rose-200 text-rose-950'
          : 'bg-amber-50/90 border-amber-200 text-amber-950'
      }`}
      role="alert"
    >
      <div className="flex items-start sm:items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
          }`}
        >
          {isDanger ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold flex items-center gap-2">
            {title}
            {budgetAlerts.length > 1 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  isDanger
                    ? 'bg-rose-200/80 text-rose-800'
                    : 'bg-amber-200/80 text-amber-800'
                }`}
              >
                +{budgetAlerts.length - 1} more alert{budgetAlerts.length - 1 > 1 ? 's' : ''}
              </span>
            )}
          </h4>
          <p className="text-xs text-gray-600 mt-0.5 max-w-2xl leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
        <Link
          to="/budgets"
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
            isDanger
              ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20'
              : 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm shadow-amber-600/20'
          }`}
        >
          Manage Budgets
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors"
          aria-label="Dismiss notification banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

