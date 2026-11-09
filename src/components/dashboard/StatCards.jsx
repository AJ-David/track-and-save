import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import Card from '../ui/Card';
import { cn } from '../../lib/utils';
import { formatCurrency } from '../../lib/formatters';
import { useApp } from '../../contexts/AppContext';
import { CURRENCIES } from '../../lib/constants';

const statConfig = [
  {
    key: 'balance',
    label: 'Total Balance',
    icon: DollarSign,
    color: 'red',
    bgColor: 'bg-red-950/60 border border-red-800/40',
    iconColor: 'text-red-400',
    trend: '+12.5%',
    trendUp: true,
  },
  {
    key: 'income',
    label: 'Total Income',
    icon: TrendingUp,
    color: 'emerald',
    bgColor: 'bg-emerald-950/50 border border-emerald-800/40',
    iconColor: 'text-emerald-400',
    trend: '+8.2%',
    trendUp: true,
  },
  {
    key: 'expenses',
    label: 'Total Expenses',
    icon: TrendingDown,
    color: 'red',
    bgColor: 'bg-red-950/50 border border-red-800/40',
    iconColor: 'text-red-400',
    trend: '+3.1%',
    trendUp: false,
  },
  {
    key: 'savings',
    label: 'Total Savings',
    icon: PiggyBank,
    color: 'amber',
    bgColor: 'bg-amber-950/50 border border-amber-800/40',
    iconColor: 'text-amber-400',
    trend: '+15.3%',
    trendUp: true,
  },
];

export default function StatCards({ summary }) {
  const { currency } = useApp();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
      {statConfig.map(({ key, label, icon: Icon, bgColor, iconColor, trend, trendUp }) => (
        <Card key={key} className="group hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{label}</p>
              <p
                className="text-2xl font-black text-white mt-1.5 tracking-tight cursor-help"
                title={CURRENCIES[currency]?.name ? `${CURRENCIES[currency].name} (${CURRENCIES[currency].code})` : undefined}
              >
                {formatCurrency(summary[key] || 0, currency)}
              </p>
            </div>
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shadow-inner', bgColor)}>
              <Icon className={cn('w-5 h-5', iconColor)} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={cn(
                'text-xs font-bold',
                trendUp ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {trend}
            </span>
            <span className="text-xs text-zinc-500">vs last month</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

