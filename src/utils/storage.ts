import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class SupabaseStorage {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Web fallback to localStorage
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    }
    return SecureStore.getItemAsync(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Web fallback to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      return;
    }
    return SecureStore.setItemAsync(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Web fallback to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      return;
    }
    return SecureStore.deleteItemAsync(key);
  }
}

export const storage = new SupabaseStorage(); 