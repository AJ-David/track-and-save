import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import Card from '../ui/Card';
import { cn } from '../../lib/utils';
import { formatCurrency } from '../../lib/formatters';
import { useApp } from '../../contexts/AppContext';

const statConfig = [
  {
    key: 'balance',
    label: 'Total Balance',
    icon: DollarSign,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    trend: '+12.5%',
    trendUp: true,
  },
  {
    key: 'income',
    label: 'Total Income',
    icon: TrendingUp,
    color: 'blue',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    trend: '+8.2%',
    trendUp: true,
  },
  {
    key: 'expenses',
    label: 'Total Expenses',
    icon: TrendingDown,
    color: 'red',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-500',
    trend: '+3.1%',
    trendUp: false,
  },
  {
    key: 'savings',
    label: 'Total Savings',
    icon: PiggyBank,
    color: 'purple',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    trend: '+15.3%',
    trendUp: true,
  },
];

export default function StatCards({ summary }) {
  const { currency } = useApp();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
      {statConfig.map(({ key, label, icon: Icon, bgColor, iconColor, trend, trendUp }) => (
        <Card key={key} className="group hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summary[key] || 0, currency)}
              </p>
            </div>
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', bgColor)}>
              <Icon className={cn('w-5 h-5', iconColor)} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={cn(
                'text-xs font-semibold',
                trendUp ? 'text-emerald-600' : 'text-red-500'
              )}
            >
              {trend}
            </span>
            <span className="text-xs text-gray-400">vs last month</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

