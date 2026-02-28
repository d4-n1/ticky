import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook que mantiene un contenedor de scroll anclado al fondo,
 * salvo que el usuario haya scrolleado hacia arriba manualmente.
 *
 * @param {unknown} dependency - valor que al cambiar dispara el auto-scroll (e.g. expenses.length)
 * @returns {{ containerRef: React.RefObject, bottomRef: React.RefObject }}
 */
const useStickToBottom = (dependency) => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const isAtBottomRef = useRef(true);

  const isNearBottom = (el, threshold = 30) => {
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  };

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (el) {
      isAtBottomRef.current = isNearBottom(el);
    }
  }, []);

  // Registrar listener de scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Auto-scroll cuando cambia la dependencia y estamos en el fondo
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dependency]);

  return { containerRef, bottomRef };
};

export default useStickToBottom;
