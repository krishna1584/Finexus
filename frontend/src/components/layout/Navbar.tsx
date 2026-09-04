import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  User,
  Settings,
  LogOut,
  Search,
  Menu,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { formatTimeAgo } from '@/utils';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/deposit': 'Deposit & Withdraw',
  '/transfer': 'Transfer Funds',
  '/transactions': 'Transactions',
  '/profile': 'Profile & Settings',
};

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const title = routeLabels[location.pathname] ?? 'Finexus';
  const { notifications, markAllRead, markNotificationRead, toggleSidebar, toast } = useUIStore();
  const { user, logout: storeLogout } = useAuthStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    storeLogout();
    toast('info', 'Signed out', 'See you next time!');
    navigate('/login');
  };

  const displayName =
    user?.userProfileDto
      ? `${user.userProfileDto.firstName} ${user.userProfileDto.lastName}`
      : user?.emailId ?? 'User';

  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 bg-[var(--bg-surface)]/85 backdrop-blur-xl border-b border-[var(--border-subtle)] flex items-center px-4 md:px-6 gap-4 z-30 flex-shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick ?? toggleSidebar}
        className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h1 className="text-[var(--text-primary)] font-display font-semibold text-lg hidden sm:block">{title}</h1>

      {/* Search */}
      <div className="flex-1 max-w-xs hidden lg:flex items-center ml-4">
        <div className="relative w-full">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          />
          <input
            type="search"
            placeholder="Search transactions..."
            className="w-full bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle size="sm" />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="notification-bell"
            onClick={() => setShowNotifications((v) => !v)}
            className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors border border-[var(--border-subtle)]"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[var(--negative)] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[var(--accent-primary)] dark:text-[var(--accent-secondary)] hover:underline flex items-center gap-1"
                  >
                    <Check size={11} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[var(--text-secondary)] text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className="w-full text-left px-4 py-3 hover:bg-[var(--bg-surface-2)] transition-colors border-b border-[var(--border-subtle)] last:border-0"
                    >
                      <div className="flex items-start gap-2.5">
                        {!n.read && (
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] dark:bg-[var(--accent-secondary)] flex-shrink-0" />
                        )}
                        <div className={n.read ? 'ml-4' : ''}>
                          <p className="text-xs font-semibold text-[var(--text-primary)]">{n.title}</p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-[var(--text-secondary)]/60 mt-1">
                            {formatTimeAgo(n.timestamp)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            id="user-menu-button"
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-[var(--bg-surface-2)] transition-colors border border-transparent hover:border-[var(--border-subtle)]"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[#8ea6ff] dark:from-[var(--accent-secondary)] dark:to-[#e4ff9a] flex items-center justify-center">
              <span className="text-xs font-bold text-white dark:text-[#0B0F14]">{initials}</span>
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)] hidden md:block max-w-[100px] truncate">
              {displayName.split(' ')[0]}
            </span>
            <ChevronDown size={14} className="text-[var(--text-secondary)] hidden md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50">
              <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{displayName}</p>
                <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">{user?.emailId}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors"
                >
                  <User size={15} /> Profile
                </button>
                <button
                  onClick={() => { navigate('/profile?tab=preferences'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors"
                >
                  <Settings size={15} /> Preferences
                </button>
                <hr className="border-[var(--border-subtle)] my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--negative)] hover:bg-[var(--negative)]/10 transition-colors"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
