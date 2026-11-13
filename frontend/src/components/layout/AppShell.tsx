import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { userService } from '@/services/userService';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { X, Landmark, LayoutDashboard, PiggyBank, ArrowLeftRight, Receipt, User, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store/useUIStore';
import { useDialog } from '@/hooks/useDialog';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const mobileNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/deposit', icon: PiggyBank, label: 'Deposit' },
  { to: '/transfer', icon: ArrowLeftRight, label: 'Transfer' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userId = useAuthStore((s) => s.userId);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  // The profile isn't persisted across reloads (only the token is), so fetch
  // it again whenever we're signed in but don't have it in memory.
  useEffect(() => {
    if (!userId || user) return;
    let cancelled = false;
    userService
      .getUserById(userId)
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        // Non-fatal: the header falls back to a generic name.
      });
    return () => {
      cancelled = true;
    };
  }, [userId, user, setUser]);

  return (
    <div className="flex h-dvh bg-[var(--bg-primary)] overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none bg-grid opacity-30" />
      <div className="absolute -top-40 -left-24 w-[34rem] h-[34rem] rounded-full bg-[var(--accent-primary)]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-[var(--accent-secondary)]/10 blur-3xl pointer-events-none" />
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile menu (phones and small tablets; the sidebar takes over from md up) */}
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1280px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

/** Slide-in navigation for small screens, with sign-out and theme switch. */
function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const toast = useUIStore((s) => s.toast);
  // Focus trap, Escape to close, focus restore, background scroll lock.
  useDialog(open, onClose, panelRef);

  if (!open) return null;

  const handleSignOut = () => {
    onClose();
    logout();
    toast('info', 'Signed out', 'See you next time!');
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        tabIndex={-1}
        className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--accent-primary)] dark:bg-[var(--accent-secondary)] rounded-xl flex items-center justify-center">
              <Landmark size={18} className="text-white dark:text-[#0B0F14]" />
            </div>
            <span className="font-display font-bold text-[var(--text-primary)] text-lg">Finexus</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Main">
          <ul className="space-y-1">
            {mobileNavItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] dark:bg-[var(--accent-secondary-soft)] dark:text-[var(--accent-secondary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]',
                    ].join(' ')
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-[var(--border-subtle)] px-3 py-3 space-y-1">
          <div className="px-3">
            <ThemeToggle labeled />
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-[var(--negative)] hover:bg-[var(--negative)]/10"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
