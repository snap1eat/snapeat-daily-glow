
import { Storage } from '@capacitor/storage';

export class StorageService {
  static async set(key: string, value: any): Promise<void> {
    await Storage.set({
      key,
      value: JSON.stringify(value),
    });
  }

  static async get<T>(key: string): Promise<T | null> {
    const item = await Storage.get({ key });
    if (item.value) {
      return JSON.parse(item.value) as T;
    }
    return null;
  }

  static async remove(key: string): Promise<void> {
    await Storage.remove({ key });
  }

  static async clear(): Promise<void> {
    await Storage.clear();
  }

  static async keys(): Promise<string[]> {
    const { keys } = await Storage.keys();
    return keys;
  }
}
