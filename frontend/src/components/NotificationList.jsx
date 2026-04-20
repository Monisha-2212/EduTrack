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
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const list = limit ? notifications.slice(0, limit) : notifications;

  if (list.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl py-8 text-center">
        <BellOff size={24} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
      {list.map((n) => (
        <div
          key={n._id}
          onClick={() => !n.isRead && markAsRead(n._id)}
          className={cn(
            'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150',
            n.isRead ? 'opacity-70' : 'bg-green-50 hover:bg-green-100 border-l-4 border-green-500'
          )}
        >
          {/* Unread indicator */}
          <div
            className={cn(
              'w-2 h-2 rounded-full mt-1.5 shrink-0',
              n.isRead ? 'bg-gray-300' : 'bg-green-500'
            )}
          />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-green-800 leading-snug">
              {n.message}
            </p>
            <p className="text-[11px] text-green-600 mt-1">
              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
