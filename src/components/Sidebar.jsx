import { MONTH_NAMES } from '../utils/months';

const Sidebar = ({
  selectedYear,
  selectedMonth,
  onChangeYear,
  onChangeMonth,
  nowYear,
  nowMonth,
}) => {
  const canGoForwardYear = selectedYear < nowYear;
  const isCurrentYear = selectedYear === nowYear;
  const isFutureYear = selectedYear > nowYear;

  return (
    <div className='fixed left-0 top-0 h-dvh font-mono flex flex-col items-center justify-center shrink-0 select-none pb-4 pl-8 z-10'>
      {/* Selector de año */}
      <div className='flex items-center mb-4'>
        <button onClick={() => onChangeYear(-1)} className='size-10 text-2xl'>
          ←
        </button>
        <span className='font-semibold text-2xl'>{selectedYear}</span>
        <button
          onClick={() => onChangeYear(1)}
          disabled={!canGoForwardYear}
          className={`text-2xl px-1${canGoForwardYear ? '' : ' text-dark-grey cursor-default'} size-10`}
        >
          →
        </button>
      </div>

      {/* Lista de meses */}
      <div className='flex flex-col gap-2 text-sm font-medium'>
        {MONTH_NAMES.map((name, index) => {
          const disabled = isFutureYear || (isCurrentYear && index > nowMonth);
          const selected = selectedMonth === index;

          return (
            <button
              key={name}
              onClick={() => !disabled && onChangeMonth(index)}
              disabled={disabled}
              className={`px-2 py-0.5 text-center${
                selected
                  ? ' bg-black text-white'
                  : disabled
                    ? ' text-dark-grey cursor-default'
                    : ' hover:bg-black hover:text-white'
              }`}
            >
              {name.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
