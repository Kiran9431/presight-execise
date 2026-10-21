import { SortBy, SortOrder } from '../types';

interface SortControlsProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'age', label: 'Age' },
  { value: 'nationality', label: 'Nationality' },
];

export function SortControls({ sortBy, sortOrder, onSortChange }: SortControlsProps) {
  const handleSortByChange = (newSortBy: SortBy) => {
    onSortChange(newSortBy, sortOrder);
  };

  const handleSortOrderToggle = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(sortBy, newSortOrder);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 font-medium">Sort by:</span>
      <select
        value={sortBy}
        onChange={(e) => handleSortByChange(e.target.value as SortBy)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        onClick={handleSortOrderToggle}
        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
      >
        {sortOrder === 'asc' ? (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
    </div>
  );
}
