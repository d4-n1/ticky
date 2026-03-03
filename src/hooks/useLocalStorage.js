import { useCallback, useRef, useState } from 'react';

const PREFIX = 'ticky_';

const useLocalStorage = (key, defaultValue) => {
  const storageKey = PREFIX + key;
  const keyRef = useRef(storageKey);
  keyRef.current = storageKey;

  const readStorage = (k) => {
    try {
      const stored = localStorage.getItem(k);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [value, setValueRaw] = useState(() => readStorage(storageKey));

  // Re-leer cuando cambia la clave
  const prevKeyRef = useRef(storageKey);
  if (prevKeyRef.current !== storageKey) {
    prevKeyRef.current = storageKey;
    setValueRaw(readStorage(storageKey));
  }

  // Setter estable que escribe sincrónicamente a localStorage
  const setValue = useCallback((updater) => {
    setValueRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(keyRef.current, JSON.stringify(next));
      return next;
    });
  }, []);

  return [value, setValue];
};

export default useLocalStorage;
