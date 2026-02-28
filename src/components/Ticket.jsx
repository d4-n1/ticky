// Sirve para anclar el scroll en la parte inferior
import { useEffect, useRef } from 'react';

const ExpenseRow = (props) => {
  return (
    <div className='col-span-full grid grid-cols-subgrid px-1 py-0.5'>
      <div className='pr-[1ch]'>
        <select
          name='category'
          value={props.category}
          className='w-[3ch] appearance-none focus:bg-grey focus:outline-none'
          onChange={(e) => props.onChange(props.index, e)}
        >
          <option>HOG</option>
          <option>SUS</option>
          <option>SUP</option>
        </select>
      </div>
      <div className='pr-[1ch]'>
        <input
          name='name'
          className='w-full focus:bg-grey focus:outline-none'
          value={props.name}
          onChange={(e) => props.onChange(props.index, e)}
        />
      </div>
      <div>
        <input
          name='amount'
          type='number'
          className='w-[10ch] text-right focus:bg-grey focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          value={props.amount}
          onChange={(e) => props.onChange(props.index, e)}
        />
      </div>
    </div>
  );
};

const AddExpense = (props) => {
  return (
    <button className='flex flex-row col-span-full px-1 py-0.5 items-center font-bold focus:bg-grey focus:outline-none'>
      <div className='w-[3ch] mr-[1ch] bg-black text-white flex items-center justify-center h-4'>
        <img src='/src/assets/icons/plus.svg' alt='+' />
      </div>
      <div>{props.label}</div>
    </button>
  );
};

const Divider = () => {
  return (
    <span className='col-span-full py-2 font-mono'>
      ------------------------------------------
    </span>
  );
};

const Total = ({ expenses }) => {
  let total = 0;

  expenses.map((expense) => {
    total += Number(expense.amount);
  });

  return (
    <div className='col-span-full flex place-content-between bg-black text-white py-0.5 px-1 font-normal'>
      <p>TOTAL</p>
      <p>{total}</p>
    </div>
  );
};

const Ticket = ({ expenses, onChange }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  return (
    <div className='grid grid-cols-[auto_1fr_auto] p-[4ch] bg-white relative mt-20'>
      <div className='w-full h-1 absolute -top-1 left-0 bg-[url(/src/assets/ticket-border.svg)] bg-repeat-x bg-size-[1ch]'></div>
      <h1 className='col-span-full text-center font-semibold text-2xl'>
        ENERO
      </h1>
      <Divider />
      <div className='col-span-full grid grid-cols-subgrid px-1 py-0.5 text-dark-grey'>
        <p className='pr-[1ch]'>CAT</p>
        <p>NOMBRE</p>
        <p className='text-end'>EUR</p>
      </div>

      {expenses.map((expense, index) => {
        return (
          <ExpenseRow
            key={index}
            index={index}
            category={expense.category}
            name={expense.name}
            amount={expense.amount}
            onChange={onChange}
          />
        );
      })}

      <AddExpense label={'NUEVO GASTO (⌘N)'} />
      <Divider />
      <Total expenses={expenses} />
      <Divider />
      <div className='col-span-full text-center px-1 py-0.5'>BUEN DÍA :^)</div>

      {/* Sirve para anclar el scroll en la parte inferior */}
      <div ref={bottomRef} />
    </div>
  );
};

export default Ticket;
