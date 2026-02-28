import { useState, useRef } from 'react';

const abbr = (name) => name.slice(0, 3).toUpperCase();

const CategoryInput = ({ value, categories, onChange, onAddCategory, onFocus, inputRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);
  const blurTimeout = useRef(null);

  const displayValue = value ? abbr(value) : '';

  const filtered = inputValue
    ? categories.filter((cat) => {
        const q = inputValue.toLowerCase();
        return cat.includes(q) || abbr(cat).toLowerCase().includes(q);
      })
    : categories;

  const showCreate = inputValue.trim() && !categories.some(
    (cat) => cat.toLowerCase() === inputValue.toLowerCase().trim()
  );
  const totalOptions = filtered.length + (showCreate ? 1 : 0);

  const select = (categoryName) => {
    clearTimeout(blurTimeout.current);
    onChange({ target: { name: 'category', value: categoryName } });
    setIsOpen(false);
    setInputValue('');
  };

  const handleFocusInput = (e) => {
    setIsOpen(true);
    setInputValue(value || '');
    setHighlightedIndex(0);
    onFocus?.();
    if (e.isTrusted) {
      requestAnimationFrame(() => inputRef?.current?.select());
    }
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => {
      setIsOpen(false);
      setInputValue('');
    }, 150);
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    setHighlightedIndex(0);
    if (!isOpen) setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape') {
      e.nativeEvent.stopImmediatePropagation();
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % totalOptions);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex < filtered.length) {
          select(filtered[highlightedIndex]);
        } else if (showCreate) {
          const name = onAddCategory(inputValue);
          select(name);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setInputValue('');
        break;
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        ref={inputRef}
        name="category"
        className="w-[3ch] focus:bg-grey focus:outline-none"
        value={isOpen ? inputValue : displayValue}
        onChange={handleChange}
        onFocus={handleFocusInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {isOpen && inputValue && totalOptions > 0 && (
        <ul className="absolute top-0 right-full mr-2 z-10 bg-black text-white min-w-max">
          {filtered.map((cat, i) => (
            <li
              key={cat}
              className={`px-1 cursor-pointer${i === highlightedIndex ? ' bg-soft-black' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(cat)}
              onMouseEnter={() => setHighlightedIndex(i)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </li>
          ))}
          {showCreate && (
            <li
              className={`px-1 cursor-pointer${highlightedIndex === filtered.length ? ' bg-soft-black' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const name = onAddCategory(inputValue);
                select(name);
              }}
              onMouseEnter={() => setHighlightedIndex(filtered.length)}
            >
              + Crear "{inputValue.trim()}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CategoryInput;
