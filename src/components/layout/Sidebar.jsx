import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  BarChart3,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { APP_NAME } from '../../lib/constants';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/budgets', label: 'Budgets', icon: Wallet },
  { path: '/savings', label: 'Savings Goals', icon: PiggyBank },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { sidebarOpen, closeSidebar } = useApp();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const handleSignOut = async () => {
    closeSidebar();
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[260px] flex flex-col',
          'bg-gradient-to-b from-[#0b0c10] via-[#08090c] to-[#040507] border-r border-zinc-800/80',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo & Brand */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-rose-700 to-red-950 flex items-center justify-center font-black text-white text-xs tracking-wider shadow-lg shadow-red-950/80 border border-red-500/30">
              T&amp;S
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block leading-tight">{APP_NAME}</span>
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block">Income &bull; Budget &bull; Save</span>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={path}
                to={path}
                onClick={closeSidebar}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium',
                  'transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-red-950/50 to-transparent text-red-400 border-l-2 border-red-600 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-red-400' : 'text-zinc-400')} />
                <span>{label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-zinc-800/60">
          {/* User Profile Preview */}
          <Link
            to="/settings"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-rose-900 flex items-center justify-center shadow-md shadow-red-950/60">
              <span className="text-sm font-bold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate group-hover:text-red-400 transition-colors">
                {displayName}
              </p>
              <p className="text-xs text-zinc-500 truncate">{displayEmail}</p>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

