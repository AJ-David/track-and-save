import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Service for handling budget database operations via Supabase.
 */

export const budgetService = {
  /**
   * Fetch user budgets for a specific month.
   */
  async getBudgets(userId, month) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    let query = supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    if (month) {
      query = query.eq('month', month);
    }

    query = query.order('created_at', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((b) => ({
      ...b,
      limit: Number(b.limit_amount ?? b.limit ?? 0),
      limit_amount: Number(b.limit_amount ?? b.limit ?? 0),
    }));
  },

  /**
   * Create or update a budget for a category in a given month.
   */
  async upsertBudget(userId, budgetData) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const limitAmount = parseFloat(budgetData.limit_amount);

    // If ID is provided, perform a direct UPDATE
    if (budgetData.id) {
      const { data, error } = await supabase
        .from('budgets')
        .update({
          limit_amount: limitAmount,
          month: budgetData.month,
          updated_at: new Date().toISOString(),
        })
        .eq('id', budgetData.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        limit: Number(data.limit_amount),
        limit_amount: Number(data.limit_amount),
      };
    }

    // Otherwise perform UPSERT on unique constraint (user_id, category, month)
    const payload = {
      user_id: userId,
      category: budgetData.category,
      limit_amount: limitAmount,
      month: budgetData.month,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('budgets')
      .upsert(payload, { onConflict: 'user_id, category, month' })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      limit: Number(data.limit_amount),
      limit_amount: Number(data.limit_amount),
    };
  },

  /**
   * Delete a budget by ID.
   */
  async deleteBudget(id) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};
