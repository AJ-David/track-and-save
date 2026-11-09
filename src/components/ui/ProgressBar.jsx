import { cn } from '../../lib/utils';

/**
 * Reusable progress bar component.
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  color = 'emerald',
  size = 'md',
  showLabel = false,
  className,
}) {
  const percentage = Math.min((value / max) * 100, 100);

  const colorMap = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  const sizeMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  // Dynamic color based on percentage
  const barColor =
    percentage >= 90 ? 'bg-red-500' : percentage >= 75 ? 'bg-amber-500' : (colorMap[color] || colorMap.emerald);

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', sizeMap[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">{percentage.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}

