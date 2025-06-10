
import { Preferences } from '@capacitor/preferences';

export class StorageService {
  static async set(key: string, value: any): Promise<void> {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  }

  static async get<T>(key: string): Promise<T | null> {
    const item = await Preferences.get({ key });
    if (item.value) {
      return JSON.parse(item.value) as T;
    }
    return null;
  }

  static async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  static async clear(): Promise<void> {
    await Preferences.clear();
  }

  static async keys(): Promise<string[]> {
    const { keys } = await Preferences.keys();
    return keys;
  }
}