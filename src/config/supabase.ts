import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';
import { Database } from '../types/supabase';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create Supabase client with proper error handling (matching web app config)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: require('../utils/storage').storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
});

// Function to clear invalid tokens and reset auth state (from web app)
export const clearAuthTokens = async () => {
  try {
    console.log('🧹 clearAuthTokens: Clearing auth tokens...');
    
    // Sign out to clear any remaining session
    console.log('🧹 clearAuthTokens: Calling supabase.auth.signOut() to clear remaining session');
    await supabase.auth.signOut();
    console.log('🧹 clearAuthTokens: Auth tokens cleared successfully');
  } catch (error) {
    console.error('🧹 clearAuthTokens: Error clearing auth tokens:', error);
  }
};

// Handle auth state changes and token errors (from web app)
supabase.auth.onAuthStateChange(async (event) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 supabase.ts: Token refreshed successfully');
  } else if (event === 'SIGNED_OUT') {
    console.log('🔄 supabase.ts: SIGNED_OUT event detected');
    await clearAuthTokens();
  }
});

export default supabase; 