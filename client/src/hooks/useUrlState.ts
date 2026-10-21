import { useSearchParams } from 'react-router-dom';
import { SortBy, SortOrder } from '../types';
import { getArrayParam, setArrayParam } from '../utils/queryParams';

export interface UrlState {
  search: string;
  nationalities: string[];
  hobbies: string[];
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export interface UrlStateActions {
  updateSearch: (search: string) => void;
  toggleNationality: (nationality: string) => void;
  toggleHobby: (hobby: string) => void;
  updateSort: (sortBy: SortBy, sortOrder: SortOrder) => void;
  clearFilters: () => void;
}

export function useUrlState(): [UrlState, UrlStateActions] {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse current state from URL
  const state: UrlState = {
    search: searchParams.get('search') || '',
    nationalities: getArrayParam(searchParams, 'nationalities'),
    hobbies: getArrayParam(searchParams, 'hobbies'),
    sortBy: (searchParams.get('sortBy') as SortBy) || 'id',
    sortOrder: (searchParams.get('sortOrder') as SortOrder) || 'asc',
  };

  const actions: UrlStateActions = {
    updateSearch: (search: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (search) {
        newParams.set('search', search);
      } else {
        newParams.delete('search');
      }
      setSearchParams(newParams);
    },

    toggleNationality: (nationality: string) => {
      const newParams = new URLSearchParams(searchParams);
      const current = getArrayParam(newParams, 'nationalities');
      const index = current.indexOf(nationality);

      if (index >= 0) {
        current.splice(index, 1);
      } else {
        current.push(nationality);
      }

      setArrayParam(newParams, 'nationalities', current);
      setSearchParams(newParams);
    },

    toggleHobby: (hobby: string) => {
      const newParams = new URLSearchParams(searchParams);
      const current = getArrayParam(newParams, 'hobbies');
      const index = current.indexOf(hobby);

      if (index >= 0) {
        current.splice(index, 1);
      } else {
        current.push(hobby);
      }

      setArrayParam(newParams, 'hobbies', current);
      setSearchParams(newParams);
    },

    updateSort: (sortBy: SortBy, sortOrder: SortOrder) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('sortBy', sortBy);
      newParams.set('sortOrder', sortOrder);
      setSearchParams(newParams);
    },

    clearFilters: () => {
      setSearchParams({});
    },
  };

  return [state, actions];
}
