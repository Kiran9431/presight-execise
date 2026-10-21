import { User } from '../types';

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  const displayedHobbies = user.hobbies.slice(0, 2);
  const remainingCount = user.hobbies.length - 2;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        <img
          src={user.avatar}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-16 h-16 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 truncate">
            {user.firstName} {user.lastName}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
            <span>{user.nationality}</span>
            <span className="font-medium">{user.age} years</span>
          </div>
          {user.hobbies.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {displayedHobbies.map((hobby, index) => (
                <span key={hobby}>
                  {hobby}
                  {index < displayedHobbies.length - 1 && ', '}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="ml-1 text-blue-600 font-medium">
                  (+{remainingCount})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
