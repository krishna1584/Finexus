import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
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

  if (isAuthenticated && token) {
    return <Navigate to={redirect} replace />;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

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
    <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute -top-40 -left-20 w-[30rem] h-[30rem] rounded-full bg-[var(--accent-primary)]/16 blur-3xl" />
      <div className="absolute -bottom-44 -right-20 w-[26rem] h-[26rem] rounded-full bg-[var(--accent-secondary)]/16 blur-3xl" />

      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px]"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)] dark:bg-[var(--accent-secondary)] flex items-center justify-center shadow-[var(--shadow-soft)]">
                <Landmark size={24} className="text-white dark:text-[#0B0F14]" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-extrabold">Welcome back</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Sign in to continue to your Finexus workspace</p>
              </div>
            </Link>
          </div>

          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)] p-7">
            {import.meta.env.VITE_USE_MOCK_DATA === 'true' && (
              <div className="mb-4 p-3 rounded-2xl bg-[var(--accent-primary-soft)] border border-[var(--accent-primary)]/25 dark:bg-[var(--accent-secondary-soft)] dark:border-[var(--accent-secondary)]/30">
                <p className="text-xs font-medium text-[var(--text-primary)]">
                  Demo mode: demo@finexus.com / password123
                </p>
              </div>
            )}

            {serverError && (
              <div className="mb-4 p-3 rounded-2xl bg-[var(--negative)]/10 border border-[var(--negative)]/20">
                <p className="text-xs font-medium text-[var(--negative)]">{serverError}</p>
              </div>
            )}

            <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                id="login-email"
                placeholder="you@company.com"
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
                id="login-submit-btn"
              >
                Sign In
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
              New to Finexus?{' '}
              <Link to="/register" className="font-semibold text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]">
                Create account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}