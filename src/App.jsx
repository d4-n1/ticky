import Ticket from './components/Ticket';
import { useEffect, useState } from 'react';

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

  const addExpense = () => {
    const newExpense = { category: '', name: '', amount: '' };
    setExpenses((prev) => prev.concat(newExpense));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'n') addExpense();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setExpenses((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [name]: value } : row)),
    );
  };

  return (
    <>
      <div className='w-dvw h-dvh bg-grey flex flex-col items-center font-mono font-medium overflow-auto'>
        <div className='grow' />
        <Ticket
          expenses={expenses}
          onChange={handleChange}
          onAdd={addExpense}
        />
      </div>
    </>
  );
};

export default App;
