import Ticket from './components/Ticket';
import useStickToBottom from './hooks/useStickToBottom';
import { useCallback, useEffect, useRef, useState } from 'react';

const App = () => {
  const [expenses, setExpenses] = useState([
    {
      category: 'hogar',
      name: 'Alquiler',
      amount: 500,
    },
    {
      category: 'test',
      name: 'galletas',
      amount: 2.6,
    },
    {
      category: 'suscripciones',
      name: 'Xbox Game Pass',
      amount: 19.99,
    },
    {
      category: 'supermercados',
      name: 'LIDL',
      amount: 60.53,
    },
  ]);

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
  if (focusedRow !== null && expenses.length === 0) {
    setFocusedRow(null);
  } else if (focusedRow !== null && focusedRow >= expenses.length) {
    setFocusedRow(expenses.length - 1);
  }

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

      // Nivel INPUT: el foco real está en un input, solo manejar Escape
      if (isInput) {
        if (e.key === 'Escape') {
          target.blur();
          setFocusMode('row');
        }
        return;
      }

      // Nivel ROW: hay fila seleccionada, navegamos entre filas
      if (row !== null) {
        switch (e.key) {
          case 'ArrowDown': e.preventDefault(); setFocusedRow((row + 1) % len); break;
          case 'ArrowUp':   e.preventDefault(); setFocusedRow((row - 1 + len) % len); break;
          case 'Escape':    setFocusedRow(null); break;
          case 'n':         addExpense(); break;
          default:          e.preventDefault(); setFocusMode('input'); break;
        }
        return;
      }

      // Sin foco: flechas seleccionan primera/última fila, 'n' añade gasto
      if (len === 0) { if (e.key === 'n') addExpense(); return; }
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); setFocusedRow(0); break;
        case 'ArrowUp':   e.preventDefault(); setFocusedRow(len - 1); break;
        case 'n':         addExpense(); break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addExpense]);

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
      <div ref={containerRef} className='w-dvw h-dvh bg-grey flex flex-col items-center font-mono font-medium overflow-auto'>
        <div className='grow' />
        <Ticket
          expenses={expenses}
          onChange={handleChange}
          onAdd={addExpense}
          focusedRow={focusedRow}
          focusMode={focusMode}
          onFocusRow={handleFocusRow}
          bottomRef={bottomRef}
        />
      </div>
    </>
  );
};

export default App;
