import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ToastContainer } from '@/components/ui/Toast';
import { X, Landmark, LayoutDashboard, PiggyBank, ArrowLeftRight, Receipt, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const mobileNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/deposit', icon: PiggyBank, label: 'Deposit' },
  { to: '/transfer', icon: ArrowLeftRight, label: 'Transfer' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col">
            <div className="flex items-center justify-between px-4 py-5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[var(--accent-gold)] rounded-xl flex items-center justify-center">
                  <Landmark size={18} className="text-[#0A0A0F]" />
                </div>
                <span className="font-bold text-[var(--text-primary)] text-lg">Finexus</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3">
              <ul className="space-y-1">
                {mobileNavItems.map(({ to, icon: Icon, label }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-[var(--accent-gold-soft)] text-[var(--accent-gold)]'
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
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
}
