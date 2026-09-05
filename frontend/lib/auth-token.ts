import * as SecureStore from 'expo-secure-store';

// The JWT lives only in the device keychain/keystore: encrypted at rest, never
// in AsyncStorage or local storage where script-injected code could read it.
const TOKEN_KEY = 'wuzy.access_token';

export function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function setToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export function clearToken(): Promise<void> {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}