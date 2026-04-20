import { Bell, Plus } from 'lucide-react';

/**
 * Page-level top bar shown above the main content area.
 *
 * @param {{ title: string, showCreateButton?: boolean, onCreateClick?: () => void, unreadCount?: number }} props
 */
export default function TopBar({ title, showCreateButton, onCreateClick, unreadCount = 0 }) {
  return (
    <header className="flex items-center justify-between px-6 py-3.5
                        bg-white
                        border-b border-gray-200
                        sticky top-0 z-10">

      {/* Page title */}
      <h2 className="text-sm font-extrabold text-gray-900">
        {title}
      </h2>

      {/* Right actions */}
      <div className="flex items-center gap-2">

        <button
          id="topbar-notifications-btn"
          aria-label="Notifications"
          className="relative w-8 h-8 border border-gray-300
                     rounded-lg flex items-center justify-center
                     text-gray-600
                     hover:bg-gray-50
                     transition-colors duration-150"
        >
          <Bell size={14} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 w-2 h-2 bg-indigo-700 rounded-full"
              aria-label={`${unreadCount} unread notifications`}
            />
          )}
        </button>

        {showCreateButton && (
          <button
            id="topbar-create-assignment-btn"
            onClick={onCreateClick}
            className="flex items-center gap-1.5 bg-indigo-700 hover:bg-indigo-800
                       active:bg-indigo-900 text-white text-sm px-3 py-1.5 rounded-lg
                       transition-colors duration-150"
          >
            <Plus size={14} />
            New Assignment
          </button>
        )}
      </div>
    </header>
  );
}
