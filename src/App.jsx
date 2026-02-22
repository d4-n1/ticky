import Ticket from './components/Ticket';

const App = () => {
  const expenses = [
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
  ];

  return (
    <>
      <div className='w-dvw h-dvh bg-grey flex flex-col items-center font-mono font-medium overflow-auto'>
        <div className='grow' />
        <Ticket expenses={expenses} />
      </div>
    </>
  );
};

export default App;
