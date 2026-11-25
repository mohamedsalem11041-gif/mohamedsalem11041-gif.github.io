
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase: SupabaseClient<Database> | null = supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;

/** Returns the Supabase client or throws if not configured. Use in services that require Supabase. */
export function getSupabase(): SupabaseClient<Database> {
    if (!supabase) throw new Error('Supabase is not configured');
    return supabase;
}
