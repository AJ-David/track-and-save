import { cn } from '../../lib/utils';

/**
 * EmptyState — used when no data is available.
 */
export default function EmptyState({
  icon: Icon,
  title = 'No data yet',
  description = 'Get started by adding your first entry.',
  action,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-zinc-600" />
        </div>
      )}
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

