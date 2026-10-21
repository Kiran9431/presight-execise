import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { User, Pagination } from '../types';
import { UserCard } from './UserCard';
import { LoadingState } from './LoadingState';

interface UserListProps {
  users: User[];
  pagination: Pagination | null;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export function UserList({ users, pagination, loadingMore, onLoadMore }: UserListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  const items = virtualizer.getVirtualItems();

  // Detect when user scrolls near the bottom
  useEffect(() => {
    const lastItem = items[items.length - 1];
    if (!lastItem) return;

    // If the last item is visible and we have more data to load
    if (
      lastItem.index >= users.length - 1 &&
      pagination?.hasMore &&
      !loadingMore
    ) {
      onLoadMore();
    }
  }, [items, users.length, pagination, loadingMore, onLoadMore]);

  return (
    <div ref={parentRef} className="flex-1 overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {items.map((virtualItem) => {
          const user = users[virtualItem.index];
          return (
            <div
              key={user.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="px-4 py-2">
                <UserCard user={user} />
              </div>
            </div>
          );
        })}
      </div>

      {loadingMore && (
        <div className="py-4">
          <LoadingState />
        </div>
      )}

      {pagination && !pagination.hasMore && users.length > 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          You've reached the end of the list
        </div>
      )}
    </div>
  );
}
