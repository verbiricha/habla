export const storage = window.localStorage;

export function getKey(key: string) {
  return storage.getItem(key);
}

export function removeKey(key: string) {
  storage.removeItem(key);
}

export function getJsonKey(key: string) {
  const cached = getKey(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      console.error(error);
      storage.removeItem(key);
    }
  }
}

export function setJsonKey(key: string, value: any) {
  setKey(key, JSON.stringify(value));
}

export function setKey(key: string, value: string) {
  storage.setItem(key, value);
}
