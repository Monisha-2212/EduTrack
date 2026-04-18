import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  BookOpen,
  Bell,
  Users,
  LogOut,
} from 'lucide-react';
import * as authApi from '../api/authApi.js';
import useAuthStore from '../store/authStore.js';
import { useNotifications } from '../hooks/useNotifications.js';
import { cn } from '../lib/utils.js';

// ─── Nav item config ──────────────────────────────────────────────────────────

const FACULTY_NAV = [
  { key: 'overview',      label: 'Overview',     Icon: LayoutGrid },
  { key: 'assignments',   label: 'Assignments',  Icon: BookOpen },
  { key: 'students',      label: 'Students',     Icon: Users },
  { key: 'notifications', label: 'Notifications',Icon: Bell },
];

const STUDENT_NAV = [
  { key: 'overview',        label: 'Overview',        Icon: LayoutGrid },
  { key: 'assignments',     label: 'My Assignments',  Icon: BookOpen },
  { key: 'notifications',   label: 'Notifications',   Icon: Bell },
];

// ─── Individual nav item ──────────────────────────────────────────────────────

function NavItem({ item, isActive, onClick, badge }) {
  const { Icon, label } = item;
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full cursor-pointer transition-colors duration-150',
        isActive
          ? 'bg-[#FAF8F5] text-[#8B6914] font-medium'
          : 'text-[#6B6660] hover:bg-[#FAF8F5] hover:text-[#3A3830]'
      )}
    >
      <Icon size={15} className="shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {badge > 0 && (
        <span className="bg-[#8B6914] text-[#F0EBE0] text-[10px] px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

// ─── Initials avatar ──────────────────────────────────────────────────────────

function Avatar({ name, role }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div
      className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0',
        role === 'faculty'
          ? 'bg-[#FAF8F5] text-[#8B6914]'
          : 'bg-[#EDF4E8] text-[#3A5C28]'
      )}
    >
      {initials}
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export default function Sidebar({ role, activeItem, onNavigate }) {
  const navigate = useNavigate();
  const clearUser = useAuthStore((s) => s.clearUser);
  const user = useAuthStore((s) => s.user);
  const { unreadCount } = useNotifications();

  const navItems = role === 'faculty' ? FACULTY_NAV : STUDENT_NAV;

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Swallow — clear client state regardless
    }
    clearUser();
    navigate('/login');
  };

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-56 h-screen bg-[#FFFDF9] dark:bg-[#1C1A17]
                        border-r border-[#EDE8DF] dark:border-[#2C2A26]
                        flex-col fixed left-0 top-0 z-10">

        {/* Top section */}
        <div className="p-5 flex-1 flex flex-col min-h-0">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#C9A96E] shrink-0" />
            <span className="text-sm font-medium text-[#8B6914] dark:text-[#F5F0E8]">EduTrack</span>
          </div>

          {/* Avatar row */}
          <div className="flex items-center gap-2.5 mb-6">
            <Avatar name={user?.name} role={role} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#2C2A26] dark:text-[#F5F0E8] truncate">
                {user?.name ?? '—'}
              </p>
              <p className="text-xs text-[#9A9288] capitalize">{role}</p>
            </div>
          </div>

          {/* Menu label */}
          <p className="text-[10px] uppercase tracking-widest text-[#9A9288] px-3 mb-1.5">
            Menu
          </p>

          {/* Nav items */}
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                isActive={activeItem === item.key}
                badge={item.key === 'notifications' ? unreadCount : 0}
                onClick={() => onNavigate(item.key)}
              />
            ))}
          </nav>
        </div>

        {/* Bottom — logout */}
        <div className="mt-auto p-4 border-t border-[#EDE8DF] dark:border-[#2C2A26]">
          <button
            id="sidebar-logout"
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-[#9A9288] hover:text-[#3A3830]
                       dark:hover:text-[#D8D4CC] transition-colors duration-150 w-full px-3 py-2"
          >
            <LogOut size={14} className="shrink-0" />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav bar (< md) ──────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#FFFDF9] dark:bg-[#1C1A17]
                      border-t border-[#EDE8DF] dark:border-[#2C2A26] flex items-center
                      justify-around px-2 py-2 safe-area-bottom">
        {navItems.map(({ key, label, Icon }) => {
          const isActive = activeItem === key;
          const badge = key === 'notifications' ? unreadCount : 0;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors duration-150 relative',
                isActive ? 'text-[#8B6914]' : 'text-[#9A9288] hover:text-[#4A4640]'
              )}
            >
              <Icon size={18} />
              <span className="text-[10px]">{label}</span>
              {badge > 0 && (
                <span className="absolute top-1 right-1.5 w-2 h-2 bg-[#8B6914] rounded-full" />
              )}
            </button>
          );
        })}

        {/* Logout icon for mobile */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[#9A9288] hover:text-[#4A4640] transition-colors"
        >
          <LogOut size={18} />
          <span className="text-[10px]">Logout</span>
        </button>
      </nav>
    </>
  );
}
