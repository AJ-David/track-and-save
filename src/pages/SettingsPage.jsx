import { useState, useEffect } from 'react';
import { User, Globe, Palette, Shield, LogOut, Check, Save, Moon, Sun } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { CURRENCIES } from '../lib/constants';

function SettingSection({ icon: Icon, title, description, children }) {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-800/40 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="text-sm text-zinc-400 mt-0.5 mb-4">{description}</p>
          {children}
        </div>
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  const {
    currency,
    setCurrency,
    baseCurrency,
    setBaseCurrency,
    isConverted,
    rateBadgeText,
  } = useApp();
  const { user, profile, updateProfile, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [profile, user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName });
      setSavedSuccess(true);
      toast.success('Profile changes saved successfully');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCurrencyChange = (e) => {
    const newCurr = e.target.value;
    setCurrency(newCurr);
    toast.info(`Display currency switched to ${newCurr}. Amounts converted using official exchange rates.`);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.info('Signed out of Track & Save');
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Settings</h2>
          <p className="text-sm text-zinc-400 mt-1">Manage your account preferences.</p>
        </div>
        <Badge color="red">Supabase Connected</Badge>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile}>
        <SettingSection
          icon={User}
          title="Profile Information"
          description="Update your personal details and public alias."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-[#161722] border border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:bg-[#1b1c29] outline-none transition-all text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || profile?.email || 'user@trackandsave.com'}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-500 cursor-not-allowed outline-none"
                disabled
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 font-semibold inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Profile changes saved
              </span>
            ) : <span />}
            <Button
              type="submit"
              size="sm"
              loading={saving}
              icon={Save}
            >
              Save Profile
            </Button>
          </div>
        </SettingSection>
      </form>

      {/* Currency Settings & Official Conversion */}
      <SettingSection
        icon={Globe}
        title="Currency & Exchange Rates"
        description="Switch your active viewing currency to convert all income, expenses, budgets and savings across the app using official exchange rates."
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Active Viewing Currency
              </label>
              <p className="text-xs text-zinc-500">
                All ledger amounts convert in real-time to this currency.
              </p>
            </div>
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="w-full sm:w-auto px-3.5 py-2.5 bg-[#161722] border border-zinc-800 rounded-xl text-sm font-semibold text-zinc-200 focus:ring-2 focus:ring-red-600 outline-none transition-all cursor-pointer"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code} className="bg-[#12131a] text-zinc-200">
                  {c.symbol} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Official Conversion Overview Box */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-400">Base Ledger Denomination:</span>
              <span className="font-bold text-white px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                {CURRENCIES[baseCurrency]?.name || baseCurrency} ({baseCurrency})
              </span>
            </div>

            {isConverted && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/60">
                <span className="font-semibold text-zinc-400">Current Conversion Rate:</span>
                <span className="font-mono font-bold text-red-400">
                  {rateBadgeText}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-800/60">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Official Baseline Central Bank Rates (Anchor: 1 USD)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/70">
                  <p className="text-zinc-500 text-[10px]">USD</p>
                  <p className="text-zinc-200 font-bold">$1.00</p>
                </div>
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/70">
                  <p className="text-zinc-500 text-[10px]">EUR</p>
                  <p className="text-zinc-200 font-bold">€0.92</p>
                </div>
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/70">
                  <p className="text-zinc-500 text-[10px]">GBP</p>
                  <p className="text-zinc-200 font-bold">£0.785</p>
                </div>
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/70">
                  <p className="text-zinc-500 text-[10px]">NGN</p>
                  <p className="text-red-400 font-bold">₦1,485.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Appearance Settings */}
      <SettingSection
        icon={Palette}
        title="Appearance & Theme"
        description="Choose your visual theme and interface atmosphere."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. Dark Mode (Mafia Noir) - Active */}
          <div
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-[#161722] to-zinc-950 border-2 border-red-600/80 text-left shadow-lg shadow-red-950/40 relative"
          >
            <div className="w-9 h-9 rounded-xl bg-red-950/70 text-red-400 border border-red-800/60 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-bold text-white tracking-tight">Dark Mode</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white shadow-sm shadow-red-900">
                  Active
                </span>
              </div>
              <p className="text-xs text-red-400 font-semibold mt-0.5">Mafia Noir Dark (Active)</p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Pitch carbon canvas, obsidian surfaces, and blood-crimson accents.
              </p>
            </div>
          </div>

          {/* 2. Light Mode - Inactive / Coming Soon */}
          <div
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800 text-left opacity-55 cursor-not-allowed select-none relative"
            title="Light mode will be implemented in a future update."
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-800/60 text-zinc-500 border border-zinc-700/40 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-bold text-zinc-400 tracking-tight">Light Mode</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Clean White Aesthetic</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Inactive. Scheduled for a future update.
              </p>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Security */}
      <SettingSection
        icon={Shield}
        title="Security & Password"
        description="Manage your credentials and password security."
      >
        <Link to="/reset-password">
          <Button variant="outline" size="sm">
            Update Password
          </Button>
        </Link>
      </SettingSection>

      {/* Sign Out Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Sign Out</h3>
            <p className="text-sm text-zinc-400 mt-0.5">End your active Track &amp; Save session.</p>
          </div>
          <Button
            variant="danger"
            icon={LogOut}
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
