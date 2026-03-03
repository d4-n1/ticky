import { useEffect, useState } from 'react';

const PREFIX = 'ticky_';

const useLocalStorage = (key, defaultValue) => {
  const storageKey = PREFIX + key;

  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  return [value, setValue];
};

export default useLocalStorage;
