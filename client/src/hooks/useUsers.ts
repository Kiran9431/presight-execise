import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Pagination, FilterOption } from '../types';
import { fetchUsers } from '../api/client';
import { UrlState } from './useUrlState';
import { PAGE_SIZE } from '../utils/constants';

interface UseUsersResult {
  users: User[];
  pagination: Pagination | null;
  filterOptions: {
    hobbies: FilterOption[];
    nationalities: FilterOption[];
  };
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  loadMore: () => void;
  refetch: () => void;
}

export function useUsers(urlState: UrlState): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filterOptions, setFilterOptions] = useState<{
    hobbies: FilterOption[];
    nationalities: FilterOption[];
  }>({ hobbies: [], nationalities: [] });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Track the current filter state to detect changes
  const prevFilterState = useRef<string>('');

  const filterStateString = JSON.stringify({
    search: urlState.search,
    nationalities: urlState.nationalities,
    hobbies: urlState.hobbies,
    sortBy: urlState.sortBy,
    sortOrder: urlState.sortOrder,
  });

  const fetchData = useCallback(
    async (page: number, append: boolean) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await fetchUsers({
          page,
          limit: PAGE_SIZE,
          search: urlState.search || undefined,
          nationalities:
            urlState.nationalities.length > 0 ? urlState.nationalities : undefined,
          hobbies: urlState.hobbies.length > 0 ? urlState.hobbies : undefined,
          sortBy: urlState.sortBy,
          sortOrder: urlState.sortOrder,
        });

        if (append) {
          setUsers((prev) => [...prev, ...response.data]);
        } else {
          setUsers(response.data);
        }

        setPagination(response.pagination);
        setFilterOptions(response.filters);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [urlState]
  );

  // When filters change, reset to page 1
  useEffect(() => {
    if (prevFilterState.current !== filterStateString) {
      prevFilterState.current = filterStateString;
      setCurrentPage(1);
      fetchData(1, false);
    }
  }, [filterStateString, fetchData]);

  const loadMore = useCallback(() => {
    if (pagination && pagination.hasMore && !loading && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchData(nextPage, true);
    }
  }, [pagination, loading, loadingMore, currentPage, fetchData]);

  const refetch = useCallback(() => {
    setCurrentPage(1);
    fetchData(1, false);
  }, [fetchData]);

  return {
    users,
    pagination,
    filterOptions,
    loading,
    loadingMore,
    error,
    loadMore,
    refetch,
  };
}
