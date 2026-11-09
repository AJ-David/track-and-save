import { cn } from '../../lib/utils';

/**
 * Reusable card component with consistent styling.
 */
export default function Card({ children, className, padding = true, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-sm font-semibold text-gray-500 uppercase tracking-wider', className)}>
      {children}
    </h3>
  );
}

