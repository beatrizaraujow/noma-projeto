import * as React from 'react';
import {
  User,
  Bell,
  Shield,
  Moon,
  Sun,
  Mail,
  Lock,
  Smartphone,
  Upload,
  Save,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Avatar } from './avatar';
import { Badge } from './badge';

export type SettingsTab = 'profile' | 'preferences' | 'security';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  jobTitle?: string;
  location?: string;
}

export interface UserPreferences {
  theme: ThemeMode;
  emailNotifications: {
    mentions: boolean;
    assigned: boolean;
    updates: boolean;
    marketing: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    mentions: boolean;
    assigned: boolean;
  };
}

export interface UserSecurity {
  twoFactorEnabled: boolean;
  lastPasswordChange?: Date;
}

export interface UserSettingsPanelProps {
  profile: UserProfile;
  preferences: UserPreferences;
  security: UserSecurity;
  activeTab?: SettingsTab;
  onTabChange?: (tab: SettingsTab) => void;
  onUpdateProfile?: (profile: Partial<UserProfile>) => Promise<void>;
  onUpdatePreferences?: (preferences: Partial<UserPreferences>) => Promise<void>;
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
  onEnable2FA?: () => Promise<void>;
  onDisable2FA?: () => Promise<void>;
  onUploadAvatar?: (file: File) => Promise<string>;
  className?: string;
}

export const UserSettingsPanel = React.forwardRef<HTMLDivElement, UserSettingsPanelProps>(
  (
    {
      profile,
      preferences,
      security,
      activeTab = 'profile',
      onTabChange,
      onUpdateProfile,
      onUpdatePreferences,
      onChangePassword,
      onEnable2FA,
      onDisable2FA,
      onUploadAvatar,
      className,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('max-w-4xl mx-auto', className)}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-neutral-200 dark:border-neutral-800">
          {[
            { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
            { id: 'preferences' as SettingsTab, label: 'Preferences', icon: Bell },
            { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange?.(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
                'border-b-2 -mb-px',
                activeTab === id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'profile' && (
            <ProfileTab
              profile={profile}
              onUpdate={onUpdateProfile}
              onUploadAvatar={onUploadAvatar}
            />
          )}
          {activeTab === 'preferences' && (
            <PreferencesTab
              preferences={preferences}
              onUpdate={onUpdatePreferences}
            />
          )}
          {activeTab === 'security' && (
            <SecurityTab
              security={security}
              onChangePassword={onChangePassword}
              onEnable2FA={onEnable2FA}
              onDisable2FA={onDisable2FA}
            />
          )}
        </div>
      </div>
    );
  }
);

UserSettingsPanel.displayName = 'UserSettingsPanel';

// Profile Tab Component
interface ProfileTabProps {
  profile: UserProfile;
  onUpdate?: (profile: Partial<UserProfile>) => Promise<void>;
  onUploadAvatar?: (file: File) => Promise<string>;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onUpdate, onUploadAvatar }) => {
  const [formData, setFormData] = React.useState(profile);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdate) return;

    setIsLoading(true);
    try {
      await onUpdate(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadAvatar) return;

    setIsLoading(true);
    try {
      const avatarUrl = await onUploadAvatar(file);
      setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
      setIsSaved(false);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <Avatar src={formData.avatar} fallback={formData.name} size="xl" />
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            JPG, PNG or GIF. Max 2MB.
          </p>
        </div>
      </div>

      {/* Name */}
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={isLoading}
          className="mt-2"
        />
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={isLoading}
          className="mt-2"
        />
      </div>

      {/* Job Title */}
      <div>
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input
          id="jobTitle"
          value={formData.jobTitle || ''}
          onChange={(e) => handleChange('jobTitle', e.target.value)}
          placeholder="e.g. Product Designer"
          disabled={isLoading}
          className="mt-2"
        />
      </div>

      {/* Location */}
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="e.g. San Francisco, CA"
          disabled={isLoading}
          className="mt-2"
        />
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          value={formData.bio || ''}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Tell us about yourself..."
          disabled={isLoading}
          rows={4}
          className={cn(
            'w-full px-3 py-2 mt-2',
            'text-sm',
            'bg-neutral-50 dark:bg-neutral-800',
            'border border-neutral-200 dark:border-neutral-700',
            'rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-orange-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-none'
          )}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isSaved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// Preferences Tab Component
interface PreferencesTabProps {
  preferences: UserPreferences;
  onUpdate?: (preferences: Partial<UserPreferences>) => Promise<void>;
}

const PreferencesTab: React.FC<PreferencesTabProps> = ({ preferences, onUpdate }) => {
  const [formData, setFormData] = React.useState(preferences);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdate) return;

    setIsLoading(true);
    try {
      await onUpdate(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      alert('Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmailNotification = (key: keyof UserPreferences['emailNotifications']) => {
    setFormData((prev) => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [key]: !prev.emailNotifications[key],
      },
    }));
    setIsSaved(false);
  };

  const togglePushNotification = (key: keyof UserPreferences['pushNotifications']) => {
    setFormData((prev) => ({
      ...prev,
      pushNotifications: {
        ...prev.pushNotifications,
        [key]: !prev.pushNotifications[key],
      },
    }));
    setIsSaved(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Theme */}
      <div>
        <Label>Theme</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, theme: mode }));
                setIsSaved(false);
              }}
              className={cn(
                'p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors',
                formData.theme === mode
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              )}
              disabled={isLoading}
            >
              {mode === 'light' && <Sun className="h-6 w-6" />}
              {mode === 'dark' && <Moon className="h-6 w-6" />}
              {mode === 'system' && <Smartphone className="h-6 w-6" />}
              <span className="text-sm font-medium capitalize">{mode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Email Notifications */}
      <div>
        <Label>Email Notifications</Label>
        <div className="mt-3 space-y-3">
          {[
            { key: 'mentions' as const, label: 'Mentions', description: 'When someone mentions you' },
            { key: 'assigned' as const, label: 'Assigned Tasks', description: 'When you are assigned to a task' },
            { key: 'updates' as const, label: 'Updates', description: 'Task updates and comments' },
            { key: 'marketing' as const, label: 'Marketing', description: 'Tips and product updates' },
          ].map(({ key, label, description }) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 cursor-pointer"
            >
              <div>
                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                  {label}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {description}
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.emailNotifications[key]}
                onChange={() => toggleEmailNotification(key)}
                disabled={isLoading}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div>
        <Label>Push Notifications</Label>
        <div className="mt-3 space-y-3">
          {[
            { key: 'enabled' as const, label: 'Enable Push Notifications', description: 'Receive browser notifications' },
            { key: 'mentions' as const, label: 'Mentions', description: 'When someone mentions you' },
            { key: 'assigned' as const, label: 'Assigned Tasks', description: 'When you are assigned to a task' },
          ].map(({ key, label, description }) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 cursor-pointer"
            >
              <div>
                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                  {label}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {description}
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.pushNotifications[key]}
                onChange={() => togglePushNotification(key)}
                disabled={isLoading || (key !== 'enabled' && !formData.pushNotifications.enabled)}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isSaved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// Security Tab Component
interface SecurityTabProps {
  security: UserSecurity;
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
  onEnable2FA?: () => Promise<void>;
  onDisable2FA?: () => Promise<void>;
}

const SecurityTab: React.FC<SecurityTabProps> = ({
  security,
  onChangePassword,
  onEnable2FA,
  onDisable2FA,
}) => {
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPasswords, setShowPasswords] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [passwordChanged, setPasswordChanged] = React.useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onChangePassword) return;

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordChanged(true);
      setTimeout(() => setPasswordChanged(false), 3000);
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAToggle = async () => {
    setIsLoading(true);
    try {
      if (security.twoFactorEnabled) {
        await onDisable2FA?.();
      } else {
        await onEnable2FA?.();
      }
    } catch (error) {
      console.error('Failed to toggle 2FA:', error);
      alert('Failed to update 2FA settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative mt-2">
              <Input
                id="current-password"
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="mt-2"
            />
          </div>

          {security.lastPasswordChange && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Last changed: {security.lastPasswordChange.toLocaleDateString()}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}>
              {passwordChanged ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Password Changed!
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          {security.twoFactorEnabled && (
            <Badge variant="success">Enabled</Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {security.twoFactorEnabled
                ? 'Two-factor authentication is currently enabled for your account.'
                : 'Enable two-factor authentication to secure your account with an additional verification step.'}
            </p>
          </div>
          <Button
            onClick={handle2FAToggle}
            disabled={isLoading}
            variant={security.twoFactorEnabled ? 'secondary' : 'default'}
          >
            {security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
        </div>
      </div>
    </div>
  );
};
