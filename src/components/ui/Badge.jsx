/**
 * Badge component for status labels, categories, etc.
 */
import { cn } from '../../lib/utils';

const colorMap = {
  green: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40',
  red: 'bg-red-950/60 text-red-400 border border-red-800/40',
  blue: 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40',
  amber: 'bg-amber-950/60 text-amber-400 border border-amber-800/40',
  purple: 'bg-purple-950/60 text-purple-400 border border-purple-800/40',
  gray: 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/40',
};

export default function Badge({ children, color = 'gray', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colorMap[color] || colorMap.gray,
        className
      )}
    >
      {children}
    </span>
  );
}

