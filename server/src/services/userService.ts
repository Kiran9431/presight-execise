import { QueryParams, UsersResponse } from '../types';
import { getUsers, getTotalCount, getTopHobbies, getTopNationalities } from '../database/queries';

export function getUsersWithFilters(params: QueryParams): UsersResponse {
  // Get paginated users
  const users = getUsers(params);

  // Get total count for pagination
  const totalCount = getTotalCount(params);
  const totalPages = Math.ceil(totalCount / params.limit);
  const hasMore = params.page < totalPages;

  // Get filter options (top 20 hobbies and nationalities)
  const hobbies = getTopHobbies(params);
  const nationalities = getTopNationalities(params);

  return {
    data: users,
    pagination: {
      page: params.page,
      limit: params.limit,
      totalPages,
      totalCount,
      hasMore
    },
    filters: {
      hobbies,
      nationalities
    }
  };
}
