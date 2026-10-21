import { UsersResponse, SortBy, SortOrder } from '../types';
import { API_BASE_URL } from '../utils/constants';

export interface FetchUsersParams {
  page: number;
  limit: number;
  search?: string;
  nationalities?: string[];
  hobbies?: string[];
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

export async function fetchUsers(params: FetchUsersParams): Promise<UsersResponse> {
  const searchParams = new URLSearchParams();

  searchParams.append('page', params.page.toString());
  searchParams.append('limit', params.limit.toString());

  if (params.search) {
    searchParams.append('search', params.search);
  }

  if (params.nationalities && params.nationalities.length > 0) {
    searchParams.append('nationalities', params.nationalities.join(','));
  }

  if (params.hobbies && params.hobbies.length > 0) {
    searchParams.append('hobbies', params.hobbies.join(','));
  }

  if (params.sortBy) {
    searchParams.append('sortBy', params.sortBy);
  }

  if (params.sortOrder) {
    searchParams.append('sortOrder', params.sortOrder);
  }

  const url = `${API_BASE_URL}/users?${searchParams.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json();
}
