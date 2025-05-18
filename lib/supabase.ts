import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Conditionally load SecureStore only in native environments
let SecureStore: typeof import('expo-secure-store') | null = null;
if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
}

// Check for localStorage availability in web environments
const hasLocalStorage =
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined' &&
  window.localStorage !== null;

// Safe storage adapter for Supabase auth
const storageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (hasLocalStorage) {
        return window.localStorage.getItem(key);
      }
      return await SecureStore?.getItemAsync(key) ?? null;
    } catch (err) {
      console.warn('storageAdapter.getItem error:', err);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (hasLocalStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      await SecureStore?.setItemAsync(key, value);
    } catch (err) {
      console.warn('storageAdapter.setItem error:', err);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (hasLocalStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      await SecureStore?.deleteItemAsync(key);
    } catch (err) {
      console.warn('storageAdapter.removeItem error:', err);
    }
  },
};

// Use environment variables from Expo (make sure they are prefixed with EXPO_PUBLIC_)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // safer for mobile apps
  },
});