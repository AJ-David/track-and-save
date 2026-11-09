import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Service for handling savings goals and contributions via Supabase.
 */

export const savingsService = {
  /**
   * Fetch all savings goals for the user.
   */
  async getGoals(userId) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('deadline', { ascending: true });

    if (error) throw error;
    return (data || []).map((g) => ({
      ...g,
      target_amount: Number(g.target_amount),
      current_amount: Number(g.current_amount || 0),
    }));
  },

  /**
   * Create a new savings goal.
   */
  async createGoal(userId, goalData) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const payload = {
      user_id: userId,
      name: goalData.name.trim(),
      target_amount: parseFloat(goalData.target_amount),
      current_amount: parseFloat(goalData.current_amount || 0),
      deadline: goalData.deadline,
      color: goalData.color || '#10b981',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('savings_goals')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      target_amount: Number(data.target_amount),
      current_amount: Number(data.current_amount),
    };
  },

  /**
   * Update an existing savings goal.
   */
  async updateGoal(id, updates) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const payload = {
      ...updates,
      name: updates.name ? updates.name.trim() : undefined,
      target_amount: updates.target_amount !== undefined ? parseFloat(updates.target_amount) : undefined,
      current_amount: updates.current_amount !== undefined ? parseFloat(updates.current_amount) : undefined,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('savings_goals')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      target_amount: Number(data.target_amount),
      current_amount: Number(data.current_amount),
    };
  },

  /**
   * Delete a savings goal.
   */
  async deleteGoal(id) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Fetch contributions history for a specific goal.
   */
  async getContributions(userId, goalId) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('savings_contributions')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Record a contribution towards a goal and increment the goal's current_amount.
   */
  async addContribution(userId, goalId, contribution) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const amount = parseFloat(contribution.amount);

    // 1. Insert contribution record
    const { data: contribData, error: contribError } = await supabase
      .from('savings_contributions')
      .insert([
        {
          user_id: userId,
          goal_id: goalId,
          amount,
          date: contribution.date || new Date().toISOString().split('T')[0],
          notes: contribution.notes?.trim() || null,
        },
      ])
      .select()
      .single();

    if (contribError) throw contribError;

    // 2. Fetch current goal and increment amount
    const { data: currentGoal, error: fetchErr } = await supabase
      .from('savings_goals')
      .select('current_amount')
      .eq('id', goalId)
      .single();

    if (!fetchErr && currentGoal) {
      const newTotal = Number(currentGoal.current_amount || 0) + amount;
      await supabase
        .from('savings_goals')
        .update({ current_amount: newTotal, updated_at: new Date().toISOString() })
        .eq('id', goalId);
    }

    return contribData;
  },
};

