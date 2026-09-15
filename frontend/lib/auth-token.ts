import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// The JWT lives only in the device keychain/keystore: encrypted at rest, never
// in AsyncStorage or local storage where script-injected code could read it.
const TOKEN_KEY = 'wuzy.access_token';

// ponytail: expo-secure-store has no web module. The web build keeps the token
// in sessionStorage (per tab, gone on close); an httpOnly cookie is the upgrade.
const web = Platform.OS === 'web';

export function getToken(): Promise<string | null> {
  if (web) return Promise.resolve(sessionStorage.getItem(TOKEN_KEY));
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function setToken(token: string): Promise<void> {
  if (web) {
    sessionStorage.setItem(TOKEN_KEY, token);
    return Promise.resolve();
  }
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export function clearToken(): Promise<void> {
  if (web) {
    sessionStorage.removeItem(TOKEN_KEY);
    return Promise.resolve();
  }
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}
