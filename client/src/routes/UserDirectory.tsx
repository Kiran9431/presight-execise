import { useUrlState } from '../hooks/useUrlState';
import { useUsers } from '../hooks/useUsers';
import { SearchBar } from '../components/SearchBar';
import { SortControls } from '../components/SortControls';
import { FilterSidebar } from '../components/FilterSidebar';
import { UserList } from '../components/UserList';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

export default function UserDirectory() {
  const [urlState, urlActions] = useUrlState();
  const { users, pagination, filterOptions, loading, loadingMore, error, loadMore, refetch } =
    useUsers(urlState);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">User Directory</h1>
          {pagination && (
            <div className="text-sm text-gray-500">
              {pagination.totalCount.toLocaleString()} users
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchBar
              initialValue={urlState.search}
              onSearchChange={urlActions.updateSearch}
            />
          </div>
          <SortControls
            sortBy={urlState.sortBy}
            sortOrder={urlState.sortOrder}
            onSortChange={urlActions.updateSort}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <FilterSidebar
          hobbies={filterOptions.hobbies}
          nationalities={filterOptions.nationalities}
          selectedHobbies={urlState.hobbies}
          selectedNationalities={urlState.nationalities}
          onToggleHobby={urlActions.toggleHobby}
          onToggleNationality={urlActions.toggleNationality}
          onClearFilters={urlActions.clearFilters}
        />

        {/* User List */}
        <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
          {loading && <LoadingState />}

          {!loading && error && <ErrorState error={error} onRetry={refetch} />}

          {!loading && !error && users.length === 0 && (
            <EmptyState onClearFilters={urlActions.clearFilters} />
          )}

          {!loading && !error && users.length > 0 && (
            <UserList
              users={users}
              pagination={pagination}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
            />
          )}
        </div>
      </div>
    </div>
  );
}
