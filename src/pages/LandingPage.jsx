import { Link } from 'react-router-dom';
import { Wallet, ArrowRight, ShieldCheck, PieChart, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import { APP_NAME } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="sm">
                Open Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 sm:py-24">
        <div className="max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Smart personal finance &amp; expense intelligence
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-6">
            Master your money with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              effortless clarity
            </span>
          </h1>

          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
            Track expenses, budget with precision, reach ambitious savings goals, and understand your financial trajectory with a delightful SaaS experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button size="lg" className="px-8 shadow-lg shadow-emerald-600/25">
                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Today'}
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/login">
                <Button variant="outline" size="lg" className="px-7 bg-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 pt-12 border-t border-gray-100 max-w-2xl mx-auto text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Bank-Grade Privacy</h4>
                <p className="text-xs text-gray-400 mt-0.5">PostgreSQL Row-Level Security keeps your records private.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Visual Analytics</h4>
                <p className="text-xs text-gray-400 mt-0.5">Live cashflow area curves and category distribution charts.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 text-purple-600">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Multi-Currency</h4>
                <p className="text-xs text-gray-400 mt-0.5">Defaulted to NGN (₦) with instant USD, EUR, and GBP support.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-gray-100 bg-white/50">
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} {APP_NAME}. Built with React, Supabase &amp; Tailwind CSS.
        </p>
      </footer>
    </div>
  );
}
