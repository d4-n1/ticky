import { useEffect, useRef } from 'react';

const formatAmount = (value) => {
  const normalized = String(value).replace(',', '.');
  const parsed = parseFloat(normalized);
  if (isNaN(parsed)) return '0,00';
  return parsed.toFixed(2).replace('.', ',');
};

const filterAmountInput = (value) => {
  let filtered = value.replace(/\./g, ',');
  filtered = filtered.replace(/[^0-9,]/g, '');
  const parts = filtered.split(',');
  if (parts.length > 2) {
    filtered = parts[0] + ',' + parts.slice(1).join('');
  }
  return filtered;
};

const ExpenseRow = (props) => {
  const firstInputRef = useRef(null);
  const skipAutoFocus = useRef(false);

  useEffect(() => {
    if (props.isFocused && props.focusMode === 'input') {
      if (skipAutoFocus.current) {
        skipAutoFocus.current = false;
        return;
      }
      firstInputRef.current?.focus();
    }
  }, [props.isFocused, props.focusMode]);

  const handleFocus = () => {
    if (!props.isFocused || props.focusMode !== 'input') {
      skipAutoFocus.current = true;
      props.onFocusRow(props.index, 'input');
    }
  };

  return (
    <div
      className={`col-span-full grid grid-cols-subgrid px-1 py-0.5${
        props.isFocused && props.focusMode === 'row' ? ' bg-grey' : ''
      }`}
    >
      <div className='pr-[1ch]'>
        <select
          ref={firstInputRef}
          name='category'
          value={props.category}
          className='w-[3ch] appearance-none focus:bg-grey focus:outline-none'
          onChange={(e) => props.onChange(props.index, e)}
          onFocus={handleFocus}
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
          onFocus={handleFocus}
        />
      </div>
      <div className='flex justify-end'>
        <input
          name='amount'
          type='text'
          inputMode='decimal'
          className='text-right focus:bg-grey focus:outline-none'
          style={{ width: `${Math.max(props.amount.length, 1)}ch` }}
          value={props.amount}
          onChange={(e) => {
            const filtered = filterAmountInput(e.target.value);
            props.onChange(props.index, {
              target: { name: 'amount', value: filtered },
            });
          }}
          onBlur={(e) => {
            props.onChange(props.index, {
              target: { name: 'amount', value: formatAmount(e.target.value) },
            });
          }}
          onFocus={handleFocus}
        />
      </div>
    </div>
  );
};

const AddExpense = (props) => {
  return (
    <button
      onClick={props.onClick}
      className='flex flex-row col-span-full px-1 py-0.5 items-center font-semibold focus:bg-grey focus:outline-none'
    >
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

  expenses.forEach((expense) => {
    const parsed = parseFloat(String(expense.amount).replace(',', '.'));
    if (!isNaN(parsed)) total += parsed;
  });

  return (
    <div className='col-span-full flex place-content-between bg-black text-white py-0.5 px-1 font-normal'>
      <p>TOTAL</p>
      <p>{formatAmount(total)}</p>
    </div>
  );
};

const Ticket = ({
  expenses,
  onChange,
  onAdd,
  focusedRow,
  focusMode,
  onFocusRow,
  bottomRef,
}) => {
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
            isFocused={focusedRow === index}
            focusMode={focusMode}
            onFocusRow={onFocusRow}
          />
        );
      })}

      <AddExpense label={'NUEVO GASTO (⇧⏎)'} onClick={onAdd} />
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
