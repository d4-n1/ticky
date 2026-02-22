import Ticket from './components/Ticket';

function App() {
  return (
    <>
      <div className='w-dvw h-dvh bg-grey flex flex-col items-center font-mono font-medium overflow-auto'>
        <div className='grow' />
        <Ticket />
      </div>
    </>
  );
}

export default App;
