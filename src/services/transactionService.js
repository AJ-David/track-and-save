import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Service for handling transaction database operations via Supabase.
 */

export const transactionService = {
  /**
   * Fetch user transactions with optional filters and sorting.
   */
  async getTransactions(userId, filters = {}) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      query = query.eq('payment_method', filters.paymentMethod);
    }

    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }

    if (filters.search) {
      query = query.ilike('description', `%${filters.search}%`);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'date-asc':
        query = query.order('date', { ascending: true });
        break;
      case 'amount-desc':
        query = query.order('amount', { ascending: false });
        break;
      case 'amount-asc':
        query = query.order('amount', { ascending: true });
        break;
      case 'date-desc':
      default:
        query = query.order('date', { ascending: false }).order('created_at', { ascending: false });
        break;
    }

    if (filters.limit) {
      const from = filters.offset || 0;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  /**
   * Create a new transaction.
   */
  async createTransaction(userId, txn) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const payload = {
      user_id: userId,
      type: txn.type,
      category: txn.category,
      amount: parseFloat(txn.amount),
      date: txn.date,
      description: txn.description.trim(),
      payment_method: txn.payment_method || 'other',
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing transaction.
   */
  async updateTransaction(id, updates) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const payload = {
      ...updates,
      amount: updates.amount !== undefined ? parseFloat(updates.amount) : undefined,
      description: updates.description ? updates.description.trim() : undefined,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('transactions')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a transaction by ID.
   */
  async deleteTransaction(id) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};

