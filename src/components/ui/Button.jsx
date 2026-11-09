import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-lg shadow-red-950/60 font-semibold',
  secondary: 'bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700 focus:ring-zinc-600 border border-zinc-700/50',
  danger: 'bg-red-950/40 text-red-400 hover:bg-red-900/50 focus:ring-red-500 border border-red-800/40',
  ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/60 focus:ring-zinc-600',
  outline: 'border border-zinc-700/80 text-zinc-200 hover:bg-zinc-800/60 focus:ring-zinc-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

/**
 * Reusable button component with multiple variants and sizes.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  icon: Icon,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl',
        'transition-all duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}

