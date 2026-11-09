import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle } from '../ui/Card';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../lib/constants';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { cn } from '../../lib/utils';
import { useApp } from '../../contexts/AppContext';

function getCategoryInfo(type, categoryId) {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find((c) => c.id === categoryId) || { label: categoryId, color: '#94a3b8' };
}

export default function RecentTransactions({ transactions }) {
  const { currency } = useApp();
  const recent = transactions.slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <Link
          to="/transactions"
          className="text-xs text-red-500 font-bold hover:text-red-400 uppercase tracking-wider transition-colors"
        >
          View all
        </Link>
      </CardHeader>

      <div className="space-y-1">
        {recent.map((txn) => {
          const cat = getCategoryInfo(txn.type, txn.category);
          const isIncome = txn.type === 'income';

          return (
            <div
              key={txn.id}
              className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-zinc-800/40 transition-colors group"
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  isIncome ? 'bg-emerald-950/60 border border-emerald-800/40' : 'bg-red-950/60 border border-red-800/40'
                )}
              >
                {isIncome ? (
                  <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-red-400" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100 truncate">
                  {txn.description}
                </p>
                <p className="text-xs text-zinc-500">
                  {cat.label} · {formatDate(txn.date, 'short')}
                </p>
              </div>

              {/* Amount */}
              <span
                className={cn(
                  'text-sm font-bold flex-shrink-0',
                  isIncome ? 'text-emerald-400' : 'text-zinc-100'
                )}
              >
                {isIncome ? '+' : '-'}
                {formatCurrency(txn.amount, currency)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

