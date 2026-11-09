import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { APP_NAME } from '../lib/constants';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword, session, user } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function verifyRecoverySession() {
      // Check URL hash for access_token or recovery type
      const hash = window.location.hash || '';
      const hasRecoveryTokens =
        hash.includes('access_token') ||
        hash.includes('type=recovery') ||
        hash.includes('type=invite');

      if (session?.user || user || hasRecoveryTokens) {
        if (mounted) {
          setHasValidSession(true);
          setCheckingSession(false);
        }
        return;
      }

      // If not yet available, check supabase.auth.getSession() with a brief timeout
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session: s } } = await supabase.auth.getSession();
          if (mounted) {
            setHasValidSession(Boolean(s));
            setCheckingSession(false);
          }
        } catch {
          if (mounted) {
            setHasValidSession(false);
            setCheckingSession(false);
          }
        }
      } else {
        if (mounted) {
          setHasValidSession(false);
          setCheckingSession(false);
        }
      }
    }

    verifyRecoverySession();

    return () => {
      mounted = false;
    };
  }, [session, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2500);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('session')) {
        setError('Your password reset session has expired or is invalid. Please request a new reset link.');
      } else {
        setError(msg || 'Failed to update password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-zinc-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 via-rose-700 to-red-950 flex items-center justify-center font-black text-white text-base tracking-wider shadow-lg shadow-red-950/80 border border-red-500/30">
            T&amp;S
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            {APP_NAME}
          </span>
        </div>
        <h2 className="text-center text-2xl font-black tracking-tight text-white">
          Set new password
        </h2>
        <p className="mt-1 text-center text-sm text-zinc-400">
          Please choose a strong password for your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-2xl shadow-black/80 border-zinc-800 p-8">
          {checkingSession ? (
            <div className="text-center py-8 space-y-3">
              <Spinner size="lg" className="mx-auto text-red-500" />
              <p className="text-sm text-zinc-400">Verifying reset authorization...</p>
            </div>
          ) : !hasValidSession ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/40 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Reset Link Expired or Missing</h3>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Password reset links are single-use and expire after a short time. Please request a new password reset email to continue.
              </p>
              <div className="pt-2 space-y-2">
                <Link to="/forgot-password" className="block">
                  <Button icon={Mail} className="w-full">
                    Request New Reset Link
                  </Button>
                </Link>
                <Link to="/login" className="block">
                  <Button variant="outline" className="w-full">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-950/60 text-red-400 border border-red-800/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">Password Updated!</h3>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                Your password has been changed successfully. Redirecting you to the dashboard...
              </p>
              <div className="pt-2">
                <Link to="/dashboard">
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-2.5 text-red-200 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-[#1b1c29] transition-all text-zinc-100 placeholder-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-[#1b1c29] transition-all text-zinc-100 placeholder-zinc-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full py-2.5 shadow-xl shadow-red-950/80"
              >
                Update Password
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
