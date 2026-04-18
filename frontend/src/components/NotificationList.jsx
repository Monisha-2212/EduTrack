import { formatDistanceToNow } from 'date-fns';
import { BellOff, Loader2 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications.js';
import { cn } from '../lib/utils.js';

/**
 * A notification feed that displays recent alerts and handles marking as read.
 * 
 * @param {{ limit?: number }} props
 */
export default function NotificationList({ limit }) {
  const { notifications, isLoading, markAsRead } = useNotifications();

  if (isLoading) {
    return (
      <div className="bg-[#FFFDF9] dark:bg-[#1C1A17] border border-[#EDE8DF] dark:border-[#2C2A26] rounded-xl p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-[#EDE8DF] dark:bg-[#1C1A17] mt-1.5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#EDE8DF] dark:bg-[#1C1A17] rounded w-3/4" />
              <div className="h-3 bg-[#FAF8F5] dark:bg-[#1C1A17]/50 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const list = limit ? notifications.slice(0, limit) : notifications;

  if (list.length === 0) {
    return (
      <div className="bg-[#FFFDF9] dark:bg-[#1C1A17] border border-[#EDE8DF] dark:border-[#2C2A26] rounded-xl py-8 text-center">
        <BellOff size={24} className="mx-auto text-[#D8D4CC] dark:text-[#3A3830] mb-2" />
        <p className="text-sm text-[#9A9288] dark:text-[#6B6660]">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFDF9] dark:bg-[#1C1A17] border border-[#EDE8DF] dark:border-[#2C2A26] rounded-xl overflow-hidden divide-y divide-[#EDE8DF] dark:divide-[#2C2A26]">
      {list.map((n) => (
        <div
          key={n._id}
          onClick={() => !n.isRead && markAsRead(n._id)}
          className={cn(
            'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150',
            n.isRead ? 'opacity-70 grayscale-[0.5]' : 'bg-[#FFFDF9] dark:bg-[#1C1A17] hover:bg-[#FAF8F5] dark:hover:bg-[#1C1A17]/50'
          )}
        >
          {/* Unread indicator */}
          <div
            className={cn(
              'w-2 h-2 rounded-full mt-1.5 shrink-0',
              n.isRead ? 'bg-[#E8E4DC] dark:bg-[#1C1A17]' : 'bg-[#C9A96E] shadow-sm shadow-[#C9A96E]/40'
            )}
          />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#3A3830] dark:text-[#D8D4CC] leading-snug">
              {n.message}
            </p>
            <p className="text-[11px] text-[#9A9288] dark:text-[#6B6660] mt-1">
              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
