import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Landmark, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { ApiError } from '@/types';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';
  const { login } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const toast = useUIStore((s) => s.toast);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Already logged in — skip the login page
  if (isAuthenticated && token) {
    return <Navigate to={redirect} replace />;
  }




  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsLoading(true);
    try {
      await login(data);
      toast('success', 'Welcome back!', 'You have signed in successfully.');
      navigate(redirect, { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      setServerError(apiErr.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      {/* Theme toggle top-right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[400px] animate-slide-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-[var(--accent-gold)] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(240,185,11,0.4)]">
              <Landmark size={26} className="text-[#0A0A0F]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Sign in to your Finexus account</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-[var(--shadow-card)]">
          {/* Demo credentials tip */}
          {import.meta.env.VITE_USE_MOCK_DATA === 'true' && (
            <div className="mb-4 p-3 rounded-xl bg-[var(--accent-gold-soft)] border border-[var(--accent-gold)]/20">
              <p className="text-xs text-[var(--accent-gold)] font-medium">
                🎯 Demo mode — use: <strong>demo@finexus.com</strong> / <strong>password123</strong>
              </p>
            </div>
          )}

          {/* Server error banner */}
          {serverError && (
            <div className="mb-4 p-3 rounded-xl bg-[var(--negative)]/10 border border-[var(--negative)]/20">
              <p className="text-xs text-[var(--negative)] font-medium">{serverError}</p>
            </div>
          )}

          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              id="login-email"
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />

            <Input
              label="Password"
              id="login-password"
              placeholder="Enter your password"
              icon={<Lock size={16} />}
              showPasswordToggle
              error={errors.password?.message}
              autoComplete="current-password"
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              iconRight={!isLoading ? <ArrowRight size={16} /> : undefined}
              className="mt-2"
              id="login-submit-btn"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[var(--accent-gold)] hover:underline font-medium">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-secondary)] mt-6">
          © 2025 Finexus • Secure Banking Platform
        </p>
      </div>
    </div>
  );
}
