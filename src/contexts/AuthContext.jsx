import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_CURRENCY } from '../lib/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clear any legacy demo session from localStorage
  useEffect(() => {
    localStorage.removeItem('spendwise_demo_session');
  }, []);

  // Fetch or create user profile from Supabase profiles table
  const fetchProfile = useCallback(async (userId, fallbackMeta = {}) => {
    if (!supabase || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile not created by trigger yet, insert manually
        const newProfile = {
          id: userId,
          full_name: fallbackMeta.full_name || 'User',
          currency: fallbackMeta.currency || DEFAULT_CURRENCY,
          theme: 'light',
        };
        const { data: created } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();
        return created || newProfile;
      }
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, []);

  // Initialize Supabase Auth state
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            if (currentSession?.user) {
              const userProfile = await fetchProfile(
                currentSession.user.id,
                currentSession.user.user_metadata
              );
              if (mounted) setProfile(userProfile);
            }
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
        }
      }

      if (mounted) setLoading(false);
    }

    initAuth();

    // Listen to Supabase auth events
    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          if (!mounted) return;

          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (newSession?.user) {
            const userProfile = await fetchProfile(
              newSession.user.id,
              newSession.user.user_metadata
            );
            if (mounted) setProfile(userProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [fetchProfile]);

  // Sign Up
  const signUp = useCallback(async ({ email, password, fullName, currency = DEFAULT_CURRENCY }) => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured yet. Please check your .env credentials.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          currency,
        },
      },
    });

    if (error) throw error;
    return data;
  }, []);

  // Sign In
  const signIn = useCallback(async ({ email, password }) => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured yet. Please check your .env credentials.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.auth.signOut();
        if (error && !error.message?.toLowerCase().includes('session')) {
          console.warn('Sign out warning:', error);
        }
      }
    } catch (err) {
      console.warn('Non-blocking sign out notice:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  }, []);

  // Request Password Reset
  const resetPassword = useCallback(async (email) => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return data;
  }, []);

  // Update Password
  const updatePassword = useCallback(async (newPassword) => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession) {
      throw new Error('No active password reset session found. Please request a new password reset link.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      if (error.message?.toLowerCase().includes('session')) {
        throw new Error('Your reset session has expired or is invalid. Please request a new password reset link.');
      }
      throw error;
    }
    return data;
  }, []);

  // Update User Profile
  const updateProfile = useCallback(async (updates) => {
    if (!user || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      isDemo: false,
      isAuthenticated: Boolean(user),
      isConfigured: isSupabaseConfigured(),
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
    }),
    [
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
