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
        'hidden md:flex flex-col h-full bg-[var(--bg-surface)] border-r border-[var(--border-subtle)]',
        'transition-all duration-200 ease-out relative',
        sidebarCollapsed ? 'w-[72px]' : 'w-[220px]',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--border-subtle)]">
        <div className="flex-shrink-0 w-9 h-9 bg-[var(--accent-gold)] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(240,185,11,0.4)]">
          <Landmark size={18} className="text-[#0A0A0F]" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-bold text-[var(--text-primary)] text-lg tracking-tight">
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
                      ? 'bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] nav-active-bar'
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
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-gold)] shadow-sm transition-colors z-10"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
