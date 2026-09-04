import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { AlertCircle, Save, Settings, Shield, User } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { userService } from '@/services/userService';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { ApiError } from '@/types';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  contactNo: z.string().optional(),
  address: z.string().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  martialStatus: z.string().optional(),
  nationality: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(6, 'Min 6 characters').max(40),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Settings },
];

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') ?? 'profile');
  const { user, userId, setUser } = useAuthStore();
  const toast = useUIStore((s) => s.toast);
  const [saving, setSaving] = useState(false);

  const profile = user?.userProfileDto;

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      address: profile?.address ?? '',
      gender: profile?.gender ?? '',
      occupation: profile?.occupation ?? '',
      martialStatus: profile?.martialStatus ?? '',
      nationality: profile?.nationality ?? '',
    },
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        address: profile.address ?? '',
        gender: profile.gender ?? '',
        occupation: profile.occupation ?? '',
        martialStatus: profile.martialStatus ?? '',
        nationality: profile.nationality ?? '',
      });
    }
  }, [profile]); // eslint-disable-line

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onSaveProfile = async (data: ProfileForm) => {
    if (!userId) return;
    setSaving(true);
    try {
      await userService.updateUser(userId, data);
      const updated = await userService.getUserById(userId);
      setUser(updated);
      toast('success', 'Profile updated', 'Changes saved successfully.');
    } catch (err) {
      const apiErr = err as ApiError;
      toast('error', 'Update failed', apiErr.message);
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (_data: PasswordForm) => {
    toast('info', 'Coming soon', 'Password change endpoint is not available in backend yet.');
    passwordForm.reset();
  };

  const initials = profile ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase() : '??';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--hero-bg)] p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary)] dark:bg-[var(--accent-secondary)] flex items-center justify-center text-white dark:text-[#0B0F14] font-display text-xl font-bold">
              {initials}
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold">{profile?.firstName ?? ''} {profile?.lastName ?? ''}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{user?.emailId}</p>
              <Badge variant="success" dot size="sm" className="mt-2">{user?.status ?? 'ACTIVE'}</Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="flex gap-2 border-b border-[var(--border-subtle)] pb-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`profile-tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`h-10 px-4 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === id ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] dark:bg-[var(--accent-secondary-soft)] dark:text-[var(--accent-secondary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]'}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </section>

      {activeTab === 'profile' && (
        <Card padding="lg">
          <CardHeader title="Personal Information" subtitle="Keep your profile up to date" />
          <form id="profile-form" onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="First Name" id="profile-firstname" error={profileForm.formState.errors.firstName?.message} {...profileForm.register('firstName')} />
              <Input label="Last Name" id="profile-lastname" error={profileForm.formState.errors.lastName?.message} {...profileForm.register('lastName')} />
            </div>

            <Input label="Contact Number" id="profile-contact" placeholder="+1 212 555 0194" {...profileForm.register('contactNo')} />
            <Input label="Address" id="profile-address" placeholder="City, Country" {...profileForm.register('address')} />

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Gender"
                id="profile-gender"
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                  { value: 'Prefer not to say', label: 'Prefer not to say' },
                ]}
                {...profileForm.register('gender')}
              />
              <Select
                label="Marital Status"
                id="profile-marital"
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'Single', label: 'Single' },
                  { value: 'Married', label: 'Married' },
                  { value: 'Divorced', label: 'Divorced' },
                  { value: 'Widowed', label: 'Widowed' },
                ]}
                {...profileForm.register('martialStatus')}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Occupation" id="profile-occupation" placeholder="Finance Manager" {...profileForm.register('occupation')} />
              <Input label="Nationality" id="profile-nationality" placeholder="American" {...profileForm.register('nationality')} />
            </div>

            <Button type="submit" loading={saving} icon={<Save size={15} />} id="profile-save-btn">Save Changes</Button>
          </form>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card padding="lg">
          <CardHeader title="Security" subtitle="Manage your account access" />
          <div className="rounded-xl border border-[var(--accent-primary)]/20 bg-[var(--accent-primary-soft)] dark:border-[var(--accent-secondary)]/30 dark:bg-[var(--accent-secondary-soft)] p-3 flex items-start gap-2 mb-4">
            <AlertCircle size={15} className="mt-0.5 text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]" />
            <p className="text-xs text-[var(--text-primary)]">Password change is currently mocked while backend endpoint is pending.</p>
          </div>

          <form id="password-form" onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <Input label="Current Password" id="current-password" showPasswordToggle error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register('currentPassword')} />
            <Input label="New Password" id="new-password" showPasswordToggle error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />
            <Input label="Confirm New Password" id="confirm-password" showPasswordToggle error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register('confirmPassword')} />
            <Button type="submit" icon={<Shield size={15} />} id="password-change-btn">Update Password</Button>
          </form>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card padding="lg">
          <CardHeader title="Preferences" subtitle="Customize your workspace" />

          <div className="space-y-5">
            <ThemeToggle labeled />

            <div className="rounded-2xl border border-[var(--border-subtle)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-3">Notifications</p>
              {[
                { id: 'notif-transactions', label: 'Transaction alerts', desc: 'Notify on every posted transaction' },
                { id: 'notif-transfers', label: 'Transfer confirmations', desc: 'Get a receipt for all outgoing transfers' },
                { id: 'notif-security', label: 'Security alerts', desc: 'Login and account protection events' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-[var(--border-subtle)] last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{item.desc}</p>
                  </div>
                  <button
                    id={item.id}
                    role="switch"
                    aria-checked="true"
                    className="relative w-11 h-6 rounded-full bg-[var(--accent-primary)] dark:bg-[var(--accent-secondary)]"
                    onClick={() => toast('info', 'Preference saved', 'Notification setting updated.')}
                  >
                    <span className="absolute top-0.5 left-5 w-5 h-5 rounded-full bg-white shadow" />
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[var(--border-subtle)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-3">Account Meta</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">User ID</span><span className="font-mono text-xs">#{userId}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">ID Number</span><span className="font-mono text-xs">{user?.identificationNumber}</span></div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
}