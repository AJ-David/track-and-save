import { cn } from '../../lib/utils';

/**
 * Reusable card component with consistent styling.
 */
export default function Card({ children, className, padding = true, ...props }) {
  return (
    <div
      className={cn(
        'bg-[#12131a] rounded-2xl border border-zinc-800/80 shadow-xl shadow-black/40 text-zinc-100',
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
    <h3 className={cn('text-xs font-bold text-zinc-400 uppercase tracking-wider', className)}>
      {children}
    </h3>
  );
}

