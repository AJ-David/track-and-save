import { useState, useEffect } from 'react';
import { User, Globe, Palette, Shield, LogOut, Check, Save } from 'lucide-react';
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
  const { currency, setCurrency } = useApp();
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
    toast.info(`Default currency switched to ${newCurr}`);
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

      {/* Currency Settings */}
      <SettingSection
        icon={Globe}
        title="Default Currency"
        description="Choose your preferred currency for all financial calculations and displays."
      >
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
      </SettingSection>

      {/* Appearance Settings */}
      <SettingSection
        icon={Palette}
        title="Appearance"
        description="Theme & visual style."
      >
        <div className="flex gap-3">
          <div
            className="px-4 py-2 bg-red-950/60 border border-red-700/60 rounded-xl text-xs font-bold text-red-400 shadow-md shadow-red-950/60"
          >
            Mafia Noir Dark (Active)
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
