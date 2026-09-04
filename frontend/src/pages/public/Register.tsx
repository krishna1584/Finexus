import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Landmark, Mail, Lock, User, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/useUIStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { passwordStrength } from '@/utils';
import type { ApiError } from '@/types';

const registerSchema = z
  .object({
    name: z.string().min(1, 'Full name is required'),
    emailId: z.string().min(1, 'Email is required').email('Enter a valid email'),
    contactNumber: z.string().optional(),
    password: z.string().min(6, 'At least 6 characters').max(40, 'Max 40 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: doRegister } = useAuth();
  const toast = useUIStore((s) => s.toast);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const strength = passwordStrength(passwordValue);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    setServerError(null);
    setIsLoading(true);
    try {
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await doRegister({
        emailId: data.emailId,
        password: data.password,
        contactNumber: data.contactNumber || '',
        firstName,
        lastName,
      });
      toast('success', 'Account created', 'Your account is ready.');
      setDone(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      const apiErr = err as ApiError;
      setServerError(apiErr.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px] rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center shadow-[var(--shadow-card)]"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--positive)]/15 border border-[var(--positive)]/25 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={34} className="text-[var(--positive)]" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-2">Account created</h2>
          <p className="text-[var(--text-secondary)]">Taking you to sign in...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute -top-44 -right-28 w-[30rem] h-[30rem] rounded-full bg-[var(--accent-primary)]/14 blur-3xl" />
      <div className="absolute -bottom-36 -left-20 w-[26rem] h-[26rem] rounded-full bg-[var(--accent-secondary)]/14 blur-3xl" />

      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[480px]"
        >
          <div className="text-center mb-7">
            <Link to="/" className="inline-flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)] dark:bg-[var(--accent-secondary)] flex items-center justify-center shadow-[var(--shadow-soft)]">
                <Landmark size={24} className="text-white dark:text-[#0B0F14]" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-extrabold">Create your Finexus account</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Set up your workspace in under 2 minutes</p>
              </div>
            </Link>
          </div>

          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)] p-7">
            {serverError && (
              <div className="mb-4 p-3 rounded-2xl bg-[var(--negative)]/10 border border-[var(--negative)]/20">
                <p className="text-xs font-medium text-[var(--negative)]">{serverError}</p>
              </div>
            )}

            <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                id="register-name"
                placeholder="Alex Morgan"
                icon={<User size={16} />}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email"
                type="email"
                id="register-email"
                placeholder="you@company.com"
                icon={<Mail size={16} />}
                error={errors.emailId?.message}
                {...register('emailId')}
              />

              <Input
                label="Phone (optional)"
                type="tel"
                id="register-phone"
                placeholder="+1 212 555 0146"
                icon={<Phone size={16} />}
                error={errors.contactNumber?.message}
                {...register('contactNumber')}
              />

              <div>
                <Input
                  label="Password"
                  id="register-password"
                  placeholder="Create a secure password"
                  icon={<Lock size={16} />}
                  showPasswordToggle
                  error={errors.password?.message}
                  {...register('password', {
                    onChange: (e) => setPasswordValue(e.target.value),
                  })}
                />
                {passwordValue && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex-1 h-1.5 rounded-full transition-all"
                          style={{ background: i < strength.score ? strength.color : 'var(--bg-surface-2)' }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px]" style={{ color: strength.color }}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                id="register-confirm-password"
                placeholder="Repeat your password"
                icon={<Lock size={16} />}
                showPasswordToggle
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoading}
                iconRight={!isLoading ? <ArrowRight size={16} /> : undefined}
                id="register-btn"
              >
                Create Account
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}