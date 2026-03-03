import Ticket from './components/Ticket';
import Sidebar from './components/Sidebar';
import { MONTH_NAMES } from './utils/months';
import useStickToBottom from './hooks/useStickToBottom';
import formatAmount from './utils/formatAmount';
import useLocalStorage from './hooks/useLocalStorage';
import { useCallback, useEffect, useRef, useState } from 'react';

// Migración: mover datos de clave vieja a clave con año/mes actual
const migrateExpenses = () => {
  const oldData = localStorage.getItem('ticky_expenses');
  if (oldData !== null) {
    const now = new Date();
    const newKey = `ticky_expenses_${now.getFullYear()}_${now.getMonth() + 1}`;
    localStorage.setItem(newKey, oldData);
    localStorage.removeItem('ticky_expenses');
  }
};
migrateExpenses();

const App = () => {
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth(); // 0-11

  const [selectedYear, setSelectedYear] = useState(nowYear);
  const [selectedMonth, setSelectedMonth] = useState(nowMonth);

  const [categories, setCategories] = useLocalStorage('categories', []);

  const addCategory = useCallback(
    (name) => {
      const lower = name.toLowerCase().trim();
      if (!lower) return '';
      setCategories((prev) => {
        if (prev.includes(lower)) return prev;
        return [...prev, lower];
      });
      return lower;
    },
    [setCategories],
  );

  const [expenses, setExpenses] = useLocalStorage(
    `expenses_${selectedYear}_${selectedMonth + 1}`,
    [],
  );

  const [focusedRow, setFocusedRow] = useState(null);
  const [focusMode, setFocusMode] = useState('row');

  // Reset foco al cambiar mes/año
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setFocusedRow(null);
    setFocusMode('row');
  }, [selectedYear, selectedMonth]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
  }, [setExpenses]);

  const addExpense = useCallback(() => {
    setExpenses((prev) => {
      const newExpenses = prev.concat({ category: '', name: '', amount: '' });
      setFocusedRow(newExpenses.length - 1);
      setFocusMode('input');
      return newExpenses;
    });
  }, [setExpenses]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const row = focusedRowRef.current;

      const len = expensesRef.current.length;
      const target = e.target;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA';

      // Navegación temporal con Shift+Arrow (solo fuera de inputs)
      if (e.shiftKey && !isInput) {
        switch (e.key) {
          case 'ArrowUp': {
            e.preventDefault();
            const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
            const newYear =
              selectedMonth === 0 ? selectedYear - 1 : selectedYear;
            setSelectedMonth(newMonth);
            setSelectedYear(newYear);
            return;
          }
          case 'ArrowDown': {
            e.preventDefault();
            const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
            const newYear =
              selectedMonth === 11 ? selectedYear + 1 : selectedYear;
            if (
              newYear > nowYear ||
              (newYear === nowYear && newMonth > nowMonth)
            )
              return;
            setSelectedMonth(newMonth);
            setSelectedYear(newYear);
            return;
          }
          case 'ArrowLeft':
            e.preventDefault();
            setSelectedYear(selectedYear - 1);
            return;
          case 'ArrowRight': {
            e.preventDefault();
            if (selectedYear >= nowYear) return;
            const newYear = selectedYear + 1;
            setSelectedYear(newYear);
            if (newYear === nowYear && selectedMonth > nowMonth) {
              setSelectedMonth(nowMonth);
            }
            return;
          }
        }
      }

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
          case 'Backspace':
            if (!isButton) {
              e.preventDefault();
              setExpenses((prev) => prev.filter((_, i) => i !== row));
              const newLen = len - 1;
              if (newLen === 0) {
                setFocusedRow(0);
              } else if (row === 0) {
                setFocusedRow(0);
              } else {
                setFocusedRow(row - 1);
              }
            }
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
  }, [
    addExpense,
    exitInputMode,
    setExpenses,
    selectedYear,
    selectedMonth,
    nowYear,
    nowMonth,
  ]);

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
    <div className='flex w-dvw h-dvh'>
      <Sidebar
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        nowYear={nowYear}
        nowMonth={nowMonth}
        onChangeYear={(delta) => {
          const newYear = selectedYear + delta;
          setSelectedYear(newYear);
          if (newYear === nowYear && selectedMonth > nowMonth) {
            setSelectedMonth(nowMonth);
          }
        }}
        onChangeMonth={setSelectedMonth}
      />

      <div
        ref={containerRef}
        className='flex-1 h-dvh bg-grey flex flex-col items-center font-mono overflow-auto'
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
          monthName={MONTH_NAMES[selectedMonth]}
        />
      </div>
    </div>
  );
};

export default App;
