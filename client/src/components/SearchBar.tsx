import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface SearchBarProps {
  initialValue: string;
  onSearchChange: (search: string) => void;
}

export function SearchBar({ initialValue, onSearchChange }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const debouncedValue = useDebounce(inputValue, 300);

  // Update URL when debounced value changes
  useEffect(() => {
    if (debouncedValue !== initialValue) {
      onSearchChange(debouncedValue);
    }
  }, [debouncedValue, onSearchChange, initialValue]);

  // Sync input with URL changes from other sources
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search by name..."
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
      {inputValue && (
        <button
          onClick={() => setInputValue('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
