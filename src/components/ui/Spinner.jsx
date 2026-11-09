import { cn } from '../../lib/utils';

/**
 * Loading spinner component.
 */
export default function Spinner({ size = 'md', className }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'rounded-full border-zinc-800 border-t-red-500 animate-spin',
          sizeMap[size]
        )}
      />
    </div>
  );
}

/**
 * Full-page loading state.
 */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    </div>
  );
}

