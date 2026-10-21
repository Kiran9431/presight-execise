import { FilterOption } from '../types';

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

export function FilterSection({ title, options, selected, onToggle }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-200 pb-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <label
              key={option.value}
              className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(option.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 truncate">{option.value}</span>
              </div>
              <span className="text-xs text-gray-500 font-medium ml-2 flex-shrink-0">
                {option.count}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
