import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Shield, Settings, Save, AlertCircle } from 'lucide-react';
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

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(6, 'Min 6 characters').max(40),
  confirmPassword: z.string().min(1, 'Required'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const TABS = [
  { id: 'profile', label: 'Profile Details', icon: User },
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

  // Reset form when user data loads
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
      // Refresh user in store
      const updated = await userService.getUserById(userId);
      setUser(updated);
      toast('success', 'Profile updated', 'Your details have been saved.');
    } catch (err) {
      const apiErr = err as ApiError;
      toast('error', 'Update failed', apiErr.message);
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (_data: PasswordForm) => {
    // No password change endpoint exists in the backend — marking as mocked
    toast('info', 'Coming soon', 'Password change endpoint is not yet available in the backend. (Mocked)');
    passwordForm.reset();
  };

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : '??';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-gold)] to-amber-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(240,185,11,0.3)]">
          <span className="text-xl font-bold text-[#0A0A0F]">{initials}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {profile?.firstName ?? ''} {profile?.lastName ?? ''}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">{user?.emailId}</p>
          <Badge variant="success" dot size="sm" className="mt-1">
            {user?.status ?? 'ACTIVE'}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-subtle)] gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`profile-tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={[
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
              activeTab === id
                ? 'border-[var(--accent-gold)] text-[var(--accent-gold)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            ].join(' ')}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Details Tab */}
      {activeTab === 'profile' && (
        <Card padding="lg">
          <CardHeader title="Personal Information" subtitle="Update your profile details" />
          <form id="profile-form" onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                id="profile-firstname"
                error={profileForm.formState.errors.firstName?.message}
                {...profileForm.register('firstName')}
              />
              <Input
                label="Last name"
                id="profile-lastname"
                error={profileForm.formState.errors.lastName?.message}
                {...profileForm.register('lastName')}
              />
            </div>

            <Input
              label="Contact number"
              id="profile-contact"
              placeholder="+65 9123 4567"
              {...profileForm.register('contactNo')}
            />

            <Input
              label="Address"
              id="profile-address"
              placeholder="Your home address"
              {...profileForm.register('address')}
            />

            <div className="grid grid-cols-2 gap-4">
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
                label="Marital status"
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

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Occupation"
                id="profile-occupation"
                placeholder="e.g. Software Engineer"
                {...profileForm.register('occupation')}
              />
              <Input
                label="Nationality"
                id="profile-nationality"
                placeholder="e.g. Singaporean"
                {...profileForm.register('nationality')}
              />
            </div>

            <Button type="submit" variant="primary" icon={<Save size={15} />} loading={saving} id="profile-save-btn">
              Save Changes
            </Button>
          </form>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card padding="lg">
          <CardHeader title="Account Security" subtitle="Change your password" />

          {/* Mocked notice */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--accent-gold-soft)] border border-[var(--accent-gold)]/20 mb-4">
            <AlertCircle size={15} className="text-[var(--accent-gold)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--accent-gold)]">
              Password change is currently mocked — no backend endpoint exists for this yet.
            </p>
          </div>

          <form id="password-form" onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <Input
              label="Current password"
              id="current-password"
              showPasswordToggle
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword')}
            />
            <Input
              label="New password"
              id="new-password"
              showPasswordToggle
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword')}
            />
            <Input
              label="Confirm new password"
              id="confirm-password"
              showPasswordToggle
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register('confirmPassword')}
            />
            <Button type="submit" variant="primary" icon={<Shield size={15} />} id="password-change-btn">
              Update Password
            </Button>
          </form>
        </Card>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <Card padding="lg">
          <CardHeader title="Preferences" subtitle="Customize your experience" />
          <div className="space-y-4">
            <ThemeToggle labeled />

            <hr className="border-[var(--border-subtle)]" />

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Notifications</p>
              {[
                { id: 'notif-transactions', label: 'Transaction alerts', desc: 'Get notified for every transaction' },
                { id: 'notif-transfers', label: 'Transfer confirmations', desc: 'Receive receipt for all transfers' },
                { id: 'notif-security', label: 'Security alerts', desc: 'Login and account activity alerts' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    id={item.id}
                    role="switch"
                    aria-checked="true"
                    className="relative w-10 h-5 rounded-full bg-[var(--accent-gold)] transition-colors"
                    onClick={() => toast('info', 'Preference saved', 'Notification settings updated.')}
                  >
                    <span className="absolute top-0.5 left-5 w-4 h-4 rounded-full bg-white shadow transition-transform" />
                  </button>
                </div>
              ))}
            </div>

            <hr className="border-[var(--border-subtle)]" />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">Account Info</p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">User ID</span>
                  <span className="font-mono text-xs text-[var(--text-primary)]">#{userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">ID Number</span>
                  <span className="font-mono text-xs text-[var(--text-primary)]">{user?.identificationNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
