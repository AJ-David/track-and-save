import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card, { CardHeader, CardTitle } from '../ui/Card';
import { EXPENSE_CATEGORIES } from '../../lib/constants';
import { formatCurrency } from '../../lib/formatters';
import { useApp } from '../../contexts/AppContext';

function getCategoryLabel(categoryId) {
  return (
    EXPENSE_CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId
  );
}

function getCategoryColor(categoryId) {
  return (
    EXPENSE_CATEGORIES.find((c) => c.id === categoryId)?.color || '#94a3b8'
  );
}

function CustomTooltip({ active, payload }) {
  const { currency } = useApp();

  if (!active || !payload?.length) return null;
  const { category, amount } = payload[0].payload;

  return (
    <div className="bg-[#151620] rounded-xl shadow-2xl border border-zinc-700/80 p-3">
      <p className="text-sm font-bold text-white">{getCategoryLabel(category)}</p>
      <p className="text-xs text-zinc-400">{formatCurrency(amount, currency)}</p>
    </div>
  );
}

export default function CategoryBreakdown({ data }) {
  const { currency } = useApp();
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  const chartData = data
    .map((d) => ({
      ...d,
      label: getCategoryLabel(d.category),
      color: getCategoryColor(d.category),
      percentage: ((d.amount / total) * 100).toFixed(1),
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <span className="text-xs text-zinc-500">This month</span>
      </CardHeader>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Pie Chart */}
        <div className="w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="amount"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                cornerRadius={4}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 w-full">
          {chartData.slice(0, 6).map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-zinc-300 truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-bold text-zinc-100">
                  {formatCurrency(item.amount, currency)}
                </span>
                <span className="text-xs text-zinc-500 w-12 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

