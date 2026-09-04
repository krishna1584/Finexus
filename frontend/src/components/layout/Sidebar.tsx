import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PiggyBank,
  ArrowLeftRight,
  Receipt,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Landmark,
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/deposit', icon: PiggyBank, label: 'Deposit' },
  { to: '/transfer', icon: ArrowLeftRight, label: 'Transfer' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, toast } = useUIStore();
  const { logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    storeLogout();
    toast('info', 'Signed out', 'See you next time!');
    navigate('/login');
  };

  return (
    <aside
      className={[
        'hidden md:flex flex-col h-full bg-[var(--bg-surface)]/95 backdrop-blur-xl border-r border-[var(--border-subtle)]',
        'transition-all duration-200 ease-out relative',
        sidebarCollapsed ? 'w-[84px]' : 'w-[252px]',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--border-subtle)]">
        <div className="flex-shrink-0 w-10 h-10 bg-[var(--accent-primary)] dark:bg-[var(--accent-secondary)] rounded-2xl flex items-center justify-center shadow-[var(--shadow-soft)]">
          <Landmark size={18} className="text-white dark:text-[#0B0F14]" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-display font-bold text-[var(--text-primary)] text-xl tracking-tight">
            Finexus
          </span>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 overflow-hidden">
        <ul className="space-y-1 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  [
                    'relative flex items-center gap-3 rounded-xl transition-all duration-150',
                    sidebarCollapsed ? 'px-2.5 py-2.5 justify-center' : 'px-3 py-2.5',
                    isActive
                      ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] dark:bg-[var(--accent-secondary-soft)] dark:text-[var(--accent-secondary)] nav-active-bar'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]',
                  ].join(' ')
                }
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium truncate">{label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-[var(--border-subtle)] space-y-1">
        <button
          onClick={handleLogout}
          className={[
            'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150',
            'text-[var(--text-secondary)] hover:text-[var(--negative)] hover:bg-[var(--negative)]/10',
            sidebarCollapsed ? 'justify-center' : '',
          ].join(' ')}
          title={sidebarCollapsed ? 'Sign out' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-[74px] w-7 h-7 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-primary)] dark:hover:text-[var(--accent-secondary)] shadow-[var(--shadow-soft)] transition-colors z-10"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
