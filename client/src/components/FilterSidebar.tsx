import { FilterOption } from '../types';
import { FilterSection } from './FilterSection';

interface FilterSidebarProps {
  hobbies: FilterOption[];
  nationalities: FilterOption[];
  selectedHobbies: string[];
  selectedNationalities: string[];
  onToggleHobby: (hobby: string) => void;
  onToggleNationality: (nationality: string) => void;
  onClearFilters: () => void;
}

export function FilterSidebar({
  hobbies,
  nationalities,
  selectedHobbies,
  selectedNationalities,
  onToggleHobby,
  onToggleNationality,
  onClearFilters,
}: FilterSidebarProps) {
  const hasActiveFilters = selectedHobbies.length > 0 || selectedNationalities.length > 0;

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        <FilterSection
          title="Nationalities"
          options={nationalities}
          selected={selectedNationalities}
          onToggle={onToggleNationality}
        />
        <FilterSection
          title="Hobbies"
          options={hobbies}
          selected={selectedHobbies}
          onToggle={onToggleHobby}
        />
      </div>
    </div>
  );
}
