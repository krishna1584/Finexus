import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Landmark, Mail, Lock, User, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/useUIStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { passwordStrength } from '@/utils';
import type { ApiError } from '@/types';

const registerSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  emailId: z.string().min(1, 'Email is required').email('Enter a valid email'),
  contactNumber: z.string().optional(),
  password: z.string().min(6, 'At least 6 characters').max(40, 'Max 40 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
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

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>({
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
      setDone(true);
      // Auto-redirect after 4s
      setTimeout(() => navigate('/login'), 4000);
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
        <div className="text-center max-w-sm animate-slide-in-up">
          <div className="w-20 h-20 rounded-full bg-[var(--positive)]/15 border border-[var(--positive)]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-[var(--positive)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Account created!</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">
            Your Finexus account is ready. Redirecting you to sign in…
          </p>
          <Button variant="primary" fullWidth onClick={() => navigate('/login')} iconRight={<ArrowRight size={16} />}>
            Sign In Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 z-50"><ThemeToggle /></div>

      <div className="w-full max-w-[420px] animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-[var(--accent-gold)] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(240,185,11,0.4)]">
              <Landmark size={22} className="text-[#0A0A0F]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create account</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">Join Finexus — free & instant</p>
            </div>
          </Link>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-[var(--shadow-card)]">
          {/* Server error */}
          {serverError && (
            <div className="mb-4 p-3 rounded-xl bg-[var(--negative)]/10 border border-[var(--negative)]/20">
              <p className="text-xs text-[var(--negative)]">{serverError}</p>
            </div>
          )}

          <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              id="register-name"
              placeholder="John Doe"
              icon={<User size={16} />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email address"
              type="email"
              id="register-email"
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              error={errors.emailId?.message}
              {...register('emailId')}
            />

            <Input
              label="Phone number (optional)"
              type="tel"
              id="register-phone"
              placeholder="+65 9123 4567"
              icon={<Phone size={16} />}
              error={errors.contactNumber?.message}
              {...register('contactNumber')}
            />

            <div>
              <Input
                label="Password"
                id="register-password"
                placeholder="Min. 6 characters"
                icon={<Lock size={16} />}
                showPasswordToggle
                error={errors.password?.message}
                {...register('password', {
                  onChange: (e) => setPasswordValue(e.target.value),
                })}
              />
              {/* Password strength meter */}
              {passwordValue && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all duration-200"
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
              label="Confirm password"
              id="register-confirm-password"
              placeholder="Repeat your password"
              icon={<Lock size={16} />}
              showPasswordToggle
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" variant="primary" fullWidth loading={isLoading} iconRight={!isLoading ? <CheckCircle size={16} /> : undefined} id="register-btn">
              Create Account
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--accent-gold)] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
