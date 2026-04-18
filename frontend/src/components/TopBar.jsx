import { Bell, Plus } from 'lucide-react';

/**
 * Page-level top bar shown above the main content area.
 *
 * @param {{ title: string, showCreateButton?: boolean, onCreateClick?: () => void, unreadCount?: number }} props
 */
export default function TopBar({ title, showCreateButton, onCreateClick, unreadCount = 0 }) {
  return (
    <header className="flex items-center justify-between px-6 py-3.5
                        bg-[#FFFDF9] dark:bg-[#1C1A17]
                        border-b border-[#EDE8DF] dark:border-[#2C2A26]
                        sticky top-0 z-10">

      {/* Page title */}
      <h2 className="text-sm font-medium text-[#2C2A26] dark:text-[#F5F0E8]">
        {title}
      </h2>

      {/* Right actions */}
      <div className="flex items-center gap-2">

        {/* Bell */}
        <button
          id="topbar-notifications-btn"
          aria-label="Notifications"
          className="relative w-8 h-8 border border-[#E8E4DC] dark:border-[#2C2A26]
                     rounded-lg flex items-center justify-center
                     text-[#6B6660] dark:text-[#9A9288]
                     hover:bg-[#FAF8F5] dark:hover:bg-[#1C1A17]
                     transition-colors duration-150"
        >
          <Bell size={14} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 w-2 h-2 bg-[#8B6914] rounded-full"
              aria-label={`${unreadCount} unread notifications`}
            />
          )}
        </button>

        {/* Create assignment (faculty only) */}
        {showCreateButton && (
          <button
            id="topbar-create-assignment-btn"
            onClick={onCreateClick}
            className="flex items-center gap-1.5 bg-[#2C2A26] hover:bg-[#3A3830]
                       active:bg-[#1C1A17] text-[#F0EBE0] text-sm px-3 py-1.5 rounded-lg
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
