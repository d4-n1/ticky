import Ticket from './components/Ticket';
import { useState } from 'react';

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
        <Ticket expenses={expenses} onChange={handleChange} />
      </div>
    </>
  );
};

export default App;
