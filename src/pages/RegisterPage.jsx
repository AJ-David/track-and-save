import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME, CURRENCIES, DEFAULT_CURRENCY } from '../lib/constants';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await signUp({ email, password, fullName, currency });
      // If user session is created immediately, navigate
      if (data?.session) {
        navigate('/dashboard', { replace: true });
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-zinc-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand */}
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 via-rose-700 to-red-950 flex items-center justify-center font-black text-white text-base tracking-wider shadow-lg shadow-red-950/80 border border-red-500/30">
            T&amp;S
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            {APP_NAME}
          </span>
        </div>
        <h2 className="text-center text-2xl font-black tracking-tight text-white">
          Create your account
        </h2>
        <p className="mt-1 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-red-400 hover:text-red-300 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-2xl shadow-black/80 border-zinc-800 p-8">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-950/60 text-red-400 border border-red-800/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">Account Created!</h3>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                A verification link has been sent to <strong className="text-zinc-200">{email}</strong>. Please check your inbox to activate your account.
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button className="w-full">Return to Sign In</Button>
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

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-[#1b1c29] transition-all text-zinc-100 placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-[#1b1c29] transition-all text-zinc-100 placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Currency Preference */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-[#1b1c29] transition-all text-zinc-100"
                >
                  {Object.values(CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#12131a] text-zinc-200">
                      {c.symbol} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-[#1b1c29] transition-all text-zinc-100 placeholder-zinc-500"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-[#1b1c29] transition-all text-zinc-100 placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                loading={loading}
                className="w-full py-2.5 mt-2 shadow-xl shadow-red-950/80"
              >
                Create Account
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

