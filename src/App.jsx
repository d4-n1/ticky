import Ticket from './components/Ticket';
import useStickToBottom from './hooks/useStickToBottom';
import formatAmount from './utils/formatAmount';
import useLocalStorage from './hooks/useLocalStorage';
import { useCallback, useEffect, useRef, useState } from 'react';

const App = () => {
  const [categories, setCategories] = useLocalStorage('categories', []);

  const addCategory = useCallback((name) => {
    const lower = name.toLowerCase().trim();
    if (!lower) return '';
    setCategories((prev) => {
      if (prev.includes(lower)) return prev;
      return [...prev, lower];
    });
    return lower;
  }, []);

  const [expenses, setExpenses] = useLocalStorage('expenses', []);

  const [focusedRow, setFocusedRow] = useState(null);
  const [focusMode, setFocusMode] = useState('row');

  const focusedRowRef = useRef(focusedRow);

  const expensesRef = useRef(expenses);

  useEffect(() => {
    focusedRowRef.current = focusedRow;
  }, [focusedRow]);

  useEffect(() => {
    expensesRef.current = expenses;
  }, [expenses]);

  // Clamping: si se borra una fila y focusedRow queda fuera de rango
  // focusedRow === expenses.length es válido (representa el botón AÑADIR GASTO)
  if (focusedRow !== null && expenses.length === 0 && focusedRow !== 0) {
    setFocusedRow(0); // Sin filas → foco al botón (índice 0)
  } else if (focusedRow !== null && focusedRow > expenses.length) {
    setFocusedRow(expenses.length); // Clamp al botón como máximo
  }

  const normalizeExpense = (expense) => {
    const amountNum = parseFloat(String(expense.amount).replace(',', '.'));
    const isEmpty =
      expense.category === '' &&
      expense.name === '' &&
      (expense.amount === '' || isNaN(amountNum) || amountNum === 0);
    if (isEmpty) return null;
    return {
      ...expense,
      name: expense.name || 'Gasto',
      amount: formatAmount(expense.amount),
    };
  };

  const exitInputMode = useCallback(() => {
    const row = focusedRowRef.current;
    const current = expensesRef.current;
    if (row !== null && row < current.length) {
      const normalized = normalizeExpense(current[row]);
      if (normalized === null) {
        setExpenses((prev) => prev.filter((_, i) => i !== row));
        const newLen = current.length - 1;
        setFocusedRow(newLen > 0 ? Math.min(row, newLen - 1) : 0);
      } else {
        setExpenses((prev) =>
          prev.map((exp, i) => (i === row ? normalized : exp)),
        );
      }
    }
    setFocusMode('row');
  }, []);

  const addExpense = useCallback(() => {
    setExpenses((prev) => {
      const newExpenses = prev.concat({ category: '', name: '', amount: '' });
      setFocusedRow(newExpenses.length - 1);
      setFocusMode('input');
      return newExpenses;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const row = focusedRowRef.current;

      const len = expensesRef.current.length;
      const target = e.target;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA';

      // Nivel INPUT: el foco real está en un input
      if (isInput) {
        if (e.key === 'Enter' && e.shiftKey) {
          e.preventDefault();
          target.blur();
          exitInputMode();
          addExpense();
        } else if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault();
          target.blur();
          exitInputMode();
        }
        return;
      }

      // Nivel ROW: hay fila o botón seleccionado, navegamos entre filas + botón
      // Índices 0..len-1 = filas, índice len = botón AÑADIR GASTO
      const total = len + 1; // filas + botón
      if (row !== null) {
        const isButton = row === len;
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setFocusedRow((row + 1) % total);
            break;
          case 'ArrowUp':
            e.preventDefault();
            setFocusedRow((row - 1 + total) % total);
            break;
          case 'Escape':
            setFocusedRow(null);
            break;
          case 'Enter':
            if (isButton) addExpense();
            else if (e.shiftKey) addExpense();
            else setFocusMode('input');
            break;
          default:
            if (!isButton && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              setFocusMode('input');
            }
            break;
        }
        return;
      }

      // Sin foco: flechas seleccionan primera fila / botón
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedRow(0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedRow(len); // Ir al botón AÑADIR GASTO
          break;
        case 'Enter':
          if (e.shiftKey) addExpense();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addExpense, exitInputMode]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setExpenses((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [name]: value } : row)),
    );
  };

  const handleFocusRow = useCallback((index, mode) => {
    setFocusedRow(index);
    setFocusMode(mode);
  }, []);

  const { containerRef, bottomRef } = useStickToBottom(expenses.length);

  return (
    <>
      <div
        ref={containerRef}
        className='w-dvw h-dvh bg-grey flex flex-col items-center font-mono overflow-auto'
      >
        <div className='grow' />
        <Ticket
          expenses={expenses}
          onChange={handleChange}
          onAdd={addExpense}
          focusedRow={focusedRow}
          focusMode={focusMode}
          onFocusRow={handleFocusRow}
          bottomRef={bottomRef}
          categories={categories}
          onAddCategory={addCategory}
        />
      </div>
    </>
  );
};

export default App;
