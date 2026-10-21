export interface User {
  id: number;
  avatar: string;
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;
  hobbies: string[];
}

export interface FilterOption {
  value: string;
  count: number;
}

export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

export interface UsersResponse {
  data: User[];
  pagination: Pagination;
  filters: {
    hobbies: FilterOption[];
    nationalities: FilterOption[];
  };
}

export interface QueryParams {
  page: number;
  limit: number;
  search?: string;
  nationalities?: string[];
  hobbies?: string[];
  sortBy: 'first_name' | 'last_name' | 'age' | 'nationality' | 'id';
  sortOrder: 'asc' | 'desc';
}
