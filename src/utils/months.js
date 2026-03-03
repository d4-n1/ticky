const formatter = new Intl.DateTimeFormat('es-ES', { month: 'long' });

export const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
  formatter.format(new Date(2000, i)).toUpperCase()
);
