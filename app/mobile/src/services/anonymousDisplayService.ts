import AsyncStorage from '@react-native-async-storage/async-storage';

type Item = { id: string | number; createdAt: string };
type Kind = 'post' | 'comment';

/** Local presentation choices only. No anonymous identity is sent to the API. */
export function createAnonymousDisplayStore(serverUrl: string, userId: number) {
  const storageKey = `summit.posts.anonymous.v1:${encodeURIComponent(serverUrl)}:${userId}`;
  const choices = new Set<string>();
  let loading: Promise<void> | undefined;
  let writing = Promise.resolve();
  let warning = '';
  // createdAt prevents a reused database ID from inheriting an old choice.
  const itemKey = (kind: Kind, item: Item) => `${kind}:${item.id}:${item.createdAt}`;

  function load(): Promise<void> {
    if (!loading) {
      loading = (async () => {
        try {
          const stored = await AsyncStorage.getItem(storageKey);
          if (stored === null) return;
          const parsed: unknown = JSON.parse(stored);
          if (!Array.isArray(parsed) || !parsed.every((key) => typeof key === 'string')) {
            throw new Error('Invalid anonymous display settings.');
          }
          for (const key of parsed) choices.add(key);
        } catch {
          warning = 'Saved anonymous display choices could not be loaded on this device.';
        }
      })();
    }
    return loading;
  }

  return {
    load,
    has(kind: Kind, item: Item): boolean {
      return choices.has(itemKey(kind, item));
    },
    warning(): string { return warning; },
    async set(kind: Kind, item: Item, enabled: boolean): Promise<void> {
      await load();
      const key = itemKey(kind, item);
      if (enabled) choices.add(key);
      else choices.delete(key);
      const snapshot = JSON.stringify([...choices]);
      // Serialize writes so quick changes cannot overwrite a newer selection.
      writing = writing.then(async () => {
        try {
          await AsyncStorage.setItem(storageKey, snapshot);
          warning = '';
        } catch {
          // Content was already saved by the API. Never report a failed post and
          // invite a duplicate submission just because local storage failed.
          warning = 'Content saved. Your anonymous display choice lasts only for this session because device storage is unavailable.';
        }
      });
      await writing;
    },
  };
}
