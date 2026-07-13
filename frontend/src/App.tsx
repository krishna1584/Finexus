import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';

// Layout
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { ToastContainer } from '@/components/ui/Toast';

// Public pages
import LandingPage from '@/pages/public/Landing';
import LoginPage from '@/pages/public/Login';
import RegisterPage from '@/pages/public/Register';

// App pages
import DashboardPage from '@/pages/app/Dashboard';
import DepositPage from '@/pages/app/Deposit';
import TransferPage from '@/pages/app/Transfer';
import TransactionsPage from '@/pages/app/Transactions';
import ProfilePage from '@/pages/app/Profile';

function ThemeInitializer() {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    // Sync from localStorage on app mount
    const stored = localStorage.getItem('finexus-theme') as 'light' | 'dark' | null;
    if (stored && stored !== theme) {
      setTheme(stored);
    } else {
      // Apply current theme to DOM
      setTheme(theme);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeInitializer />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/deposit" element={<DepositPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
