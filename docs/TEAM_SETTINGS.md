# Team & Settings Components

Complete team management and settings system with role-based access control, member management, and workspace configuration.

## 📦 Components

### 1. TeamMembersGrid
Display and manage team members with role badges, status indicators, and action menus.

### 2. InviteMemberModal
Invite new team members via email with role selection and invite link sharing.

### 3. UserSettingsPanel
Personal user settings with Profile, Preferences, and Security tabs.

### 4. WorkspaceSettingsPanel
Workspace-level settings with General, Billing, and Danger Zone tabs.

---

## 🧩 Component APIs

### TeamMembersGrid

Display team members in a responsive grid with role management.

```tsx
import { TeamMembersGrid, type TeamMember } from '@nexora/ui';

const members: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Anderson',
    email: 'sarah@example.com',
    avatar: 'https://...',
    role: 'owner',
    status: 'active',
    joinedAt: new Date('2024-01-15'),
    lastActive: new Date(),
  },
  {
    id: '2',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'admin',
    status: 'active',
    joinedAt: new Date('2024-02-01'),
    lastActive: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    role: 'member',
    status: 'invited',
    joinedAt: new Date('2024-03-10'),
  },
];

function TeamPage() {
  const currentUserId = 'user-123';

  const handleInvite = () => {
    // Open invite modal
  };

  const handleEditMember = (memberId: string) => {
    console.log('Edit member:', memberId);
  };

  const handleRemoveMember = (memberId: string) => {
    console.log('Remove member:', memberId);
  };

  const handleChangeRole = (memberId: string, newRole: MemberRole) => {
    console.log('Change role:', memberId, newRole);
  };

  const handleResendInvite = (memberId: string) => {
    console.log('Resend invite:', memberId);
  };

  return (
    <TeamMembersGrid
      members={members}
      currentUserId={currentUserId}
      canInvite={true}
      canEdit={true}
      canRemove={true}
      onInvite={handleInvite}
      onEditMember={handleEditMember}
      onRemoveMember={handleRemoveMember}
      onChangeRole={handleChangeRole}
      onResendInvite={handleResendInvite}
    />
  );
}
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `members` | `TeamMember[]` | Array of team members to display |
| `currentUserId` | `string` | ID of the currently logged-in user |
| `canInvite` | `boolean` | Whether the user can invite new members |
| `canEdit` | `boolean` | Whether the user can edit members |
| `canRemove` | `boolean` | Whether the user can remove members |
| `onInvite` | `() => void` | Optional callback when invite button is clicked |
| `onEditMember` | `(memberId: string) => void` | Optional callback when editing a member |
| `onRemoveMember` | `(memberId: string) => void` | Optional callback when removing a member |
| `onChangeRole` | `(memberId: string, newRole: MemberRole) => void` | Optional callback when changing member role |
| `onResendInvite` | `(memberId: string) => void` | Optional callback when resending an invite |

**Types:**

```tsx
type MemberRole = 'owner' | 'admin' | 'member' | 'guest';
type MemberStatus = 'active' | 'pending' | 'invited';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: Date;
  lastActive?: Date;
}
```

---

### InviteMemberModal

Modal for inviting team members with email validation and role selection.

```tsx
import { InviteMemberModal, type InviteRole } from '@nexora/ui';

function TeamPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleInvite = async (
    emails: string[],
    role: InviteRole,
    message?: string
  ) => {
    try {
      await fetch('/api/workspaces/123/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails, role, message }),
      });

      toast.success(`Invited ${emails.length} members!`);
    } catch (error) {
      console.error('Failed to invite:', error);
      throw error; // Let modal handle the error
    }
  };

  return (
    <>
      <Button onClick={() => setIsInviteOpen(true)}>
        Invite Members
      </Button>
      
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInvite}
        workspaceName="Acme Corp"
        inviteLink="https://app.nexora.com/invite/abc123"
      />
    </>
  );
}
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether the modal is open |
| `onClose` | `() => void` | Callback when modal is closed |
| `onInvite` | `(emails: string[], role: InviteRole, message?: string) => Promise<void>` | Async callback to handle invite submission |
| `workspaceName` | `string` | Name of workspace for context |
| `inviteLink` | `string` | Shareable invite link |

**Types:**

```tsx
type InviteRole = 'admin' | 'member' | 'guest';
```

**Features:**
- Multi-email input with Enter key support
- Email validation with regex pattern
- Duplicate email prevention
- Role selection with descriptions
- Optional custom message
- Invite link copy with feedback
- Loading states throughout
- Auto-reset state on close

---

### UserSettingsPanel

Personal user settings with three tabs: Profile, Preferences, Security.

```tsx
import { UserSettingsPanel, type UserProfile, type UserPreferences, type UserSecurity } from '@nexora/ui';

function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const profile: UserProfile = {
    name: 'Sarah Anderson',
    email: 'sarah@example.com',
    bio: 'Product designer passionate about creating intuitive experiences.',
    avatar: 'https://...',
    jobTitle: 'Senior Product Designer',
    location: 'San Francisco, CA',
  };

  const preferences: UserPreferences = {
    theme: 'system',
    emailNotifications: {
      mentions: true,
      assigned: true,
      updates: true,
      marketing: false,
    },
    pushNotifications: {
      enabled: true,
      mentions: true,
      assigned: true,
    },
  };

  const security: UserSecurity = {
    twoFactorEnabled: true,
    lastPasswordChange: new Date('2024-01-15'),
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  };

  const handleUpdatePreferences = async (updates: Partial<UserPreferences>) => {
    await fetch('/api/users/me/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    await fetch('/api/users/me/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  };

  const handleEnable2FA = async () => {
    const response = await fetch('/api/users/me/2fa/enable', { method: 'POST' });
    const { qrCode } = await response.json();
    // Show QR code to user
  };

  const handleDisable2FA = async () => {
    await fetch('/api/users/me/2fa/disable', { method: 'POST' });
  };

  const handleUploadAvatar = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/users/me/avatar', {
      method: 'POST',
      body: formData,
    });
    
    const { url } = await response.json();
    return url;
  };

  return (
    <UserSettingsPanel
      profile={profile}
      preferences={preferences}
      security={security}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onUpdateProfile={handleUpdateProfile}
      onUpdatePreferences={handleUpdatePreferences}
      onChangePassword={handleChangePassword}
      onEnable2FA={handleEnable2FA}
      onDisable2FA={handleDisable2FA}
      onUploadAvatar={handleUploadAvatar}
    />
  );
}
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `profile` | `UserProfile` | User profile data |
| `preferences` | `UserPreferences` | User preferences |
| `security` | `UserSecurity` | Security settings |
| `activeTab` | `SettingsTab` | Currently active tab (default: 'profile') |
| `onTabChange` | `(tab: SettingsTab) => void` | Optional callback when tab changes |
| `onUpdateProfile` | `(profile: Partial<UserProfile>) => Promise<void>` | Optional callback to update profile |
| `onUpdatePreferences` | `(preferences: Partial<UserPreferences>) => Promise<void>` | Optional callback to update preferences |
| `onChangePassword` | `(currentPassword: string, newPassword: string) => Promise<void>` | Optional callback to change password |
| `onEnable2FA` | `() => Promise<void>` | Optional callback to enable 2FA |
| `onDisable2FA` | `() => Promise<void>` | Optional callback to disable 2FA |
| `onUploadAvatar` | `(file: File) => Promise<string>` | Optional callback to upload avatar, returns URL |

**Types:**

```tsx
type SettingsTab = 'profile' | 'preferences' | 'security';
type ThemeMode = 'light' | 'dark' | 'system';

interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  jobTitle?: string;
  location?: string;
}

interface UserPreferences {
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

interface UserSecurity {
  twoFactorEnabled: boolean;
  lastPasswordChange?: Date;
}
```

---

### WorkspaceSettingsPanel

Workspace-level settings with General, Billing & Usage, and Danger Zone tabs.

```tsx
import { WorkspaceSettingsPanel, type WorkspaceGeneral, type BillingInfo } from '@nexora/ui';

function WorkspaceSettingsPage() {
  const [activeTab, setActiveTab] = useState<WorkspaceSettingsTab>('general');

  const general: WorkspaceGeneral = {
    name: 'Acme Corp',
    description: 'Building the future of productivity',
    logo: 'https://...',
    defaultView: 'board',
  };

  const billing: BillingInfo = {
    plan: 'pro',
    memberCount: 12,
    projectCount: 8,
    storageUsed: 3.2,
    storageLimit: 10,
  };

  const billingHistory: BillingHistory[] = [
    {
      id: '1',
      date: new Date('2024-03-01'),
      amount: 49.99,
      status: 'paid',
      invoice: 'https://...',
    },
    {
      id: '2',
      date: new Date('2024-02-01'),
      amount: 49.99,
      status: 'paid',
      invoice: 'https://...',
    },
  ];

  const handleUpdateGeneral = async (updates: Partial<WorkspaceGeneral>) => {
    await fetch('/api/workspaces/123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  };

  const handleUploadLogo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/workspaces/123/logo', {
      method: 'POST',
      body: formData,
    });
    
    const { url } = await response.json();
    return url;
  };

  const handleUpgradePlan = () => {
    // Navigate to upgrade flow
    window.location.href = '/upgrade';
  };

  const handleDeleteWorkspace = async () => {
    await fetch('/api/workspaces/123', {
      method: 'DELETE',
    });
    
    // Redirect to workspace selection
    window.location.href = '/workspaces';
  };

  return (
    <WorkspaceSettingsPanel
      general={general}
      billing={billing}
      billingHistory={billingHistory}
      activeTab={activeTab}
      canManageBilling={true}
      canDeleteWorkspace={true}
      onTabChange={setActiveTab}
      onUpdateGeneral={handleUpdateGeneral}
      onUploadLogo={handleUploadLogo}
      onUpgradePlan={handleUpgradePlan}
      onDeleteWorkspace={handleDeleteWorkspace}
    />
  );
}
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `general` | `WorkspaceGeneral` | General workspace settings |
| `billing` | `BillingInfo` | Billing and usage information |
| `billingHistory` | `BillingHistory[]` | Optional array of billing history records |
| `activeTab` | `WorkspaceSettingsTab` | Currently active tab (default: 'general') |
| `canManageBilling` | `boolean` | Whether user can manage billing (default: false) |
| `canDeleteWorkspace` | `boolean` | Whether user can delete workspace (default: false) |
| `onTabChange` | `(tab: WorkspaceSettingsTab) => void` | Optional callback when tab changes |
| `onUpdateGeneral` | `(general: Partial<WorkspaceGeneral>) => Promise<void>` | Optional callback to update general settings |
| `onUploadLogo` | `(file: File) => Promise<string>` | Optional callback to upload logo, returns URL |
| `onUpgradePlan` | `() => void` | Optional callback when upgrade is clicked |
| `onDeleteWorkspace` | `() => Promise<void>` | Optional callback to delete workspace |

**Types:**

```tsx
type WorkspaceSettingsTab = 'general' | 'billing' | 'danger-zone';
type PlanType = 'free' | 'pro' | 'enterprise';
type DefaultView = 'board' | 'list' | 'calendar' | 'timeline';

interface WorkspaceGeneral {
  name: string;
  description?: string;
  logo?: string;
  defaultView: DefaultView;
}

interface BillingInfo {
  plan: PlanType;
  memberCount: number;
  projectCount: number;
  storageUsed: number;
  storageLimit: number;
}

interface BillingHistory {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoice?: string;
}
```

---

## 🔐 Role-Based Access Control

### Role Hierarchy

```
Owner > Admin > Member > Guest
```

### Role Definitions

| Role | Can Invite | Can Edit Members | Can Remove Members | Can Manage Billing | Can Delete Workspace |
|------|-----------|-----------------|-------------------|-------------------|---------------------|
| **Owner** | ✅ | ✅ (except owner) | ✅ (except owner) | ✅ | ✅ |
| **Admin** | ✅ | ✅ (only members/guests) | ✅ (only members/guests) | ❌ | ❌ |
| **Member** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Guest** | ❌ | ❌ | ❌ | ❌ | ❌ |

### Permission Checks

```tsx
function hasPermission(
  currentUserRole: MemberRole,
  action: 'invite' | 'edit' | 'remove' | 'billing' | 'delete',
  targetRole?: MemberRole
): boolean {
  const roleOrder = ['guest', 'member', 'admin', 'owner'];
  const currentLevel = roleOrder.indexOf(currentUserRole);
  const targetLevel = targetRole ? roleOrder.indexOf(targetRole) : -1;

  switch (action) {
    case 'invite':
      return currentLevel >= roleOrder.indexOf('admin');
    
    case 'edit':
    case 'remove':
      if (currentLevel < roleOrder.indexOf('admin')) return false;
      if (targetRole === 'owner') return false;
      if (currentUserRole === 'admin' && targetLevel >= roleOrder.indexOf('admin')) return false;
      return true;
    
    case 'billing':
    case 'delete':
      return currentUserRole === 'owner';
    
    default:
      return false;
  }
}

// Usage
const canInvite = hasPermission(currentUserRole, 'invite');
const canEditMember = hasPermission(currentUserRole, 'edit', memberRole);
const canRemoveMember = hasPermission(currentUserRole, 'remove', memberRole);
const canManageBilling = hasPermission(currentUserRole, 'billing');
const canDeleteWorkspace = hasPermission(currentUserRole, 'delete');
```

---

## 📡 Backend Integration

### API Endpoints

#### Team Members

```typescript
// GET /api/workspaces/:workspaceId/members
// List all team members
interface GetMembersResponse {
  members: TeamMember[];
  currentUserId: string;
  currentUserRole: MemberRole;
}

// POST /api/workspaces/:workspaceId/invite
// Invite new members
interface InviteMembersRequest {
  emails: string[];
  role: InviteRole;
  message?: string;
}

// PATCH /api/workspaces/:workspaceId/members/:memberId
// Update member (change role, etc.)
interface UpdateMemberRequest {
  role?: MemberRole;
  // other fields
}

// DELETE /api/workspaces/:workspaceId/members/:memberId
// Remove member from workspace

// POST /api/workspaces/:workspaceId/members/:memberId/resend-invite
// Resend invitation email
```

#### User Settings

```typescript
// GET /api/users/me
// Get current user profile
interface GetUserResponse {
  profile: UserProfile;
  preferences: UserPreferences;
  security: UserSecurity;
}

// PATCH /api/users/me
// Update user profile
interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  jobTitle?: string;
  location?: string;
}

// PATCH /api/users/me/preferences
// Update user preferences
interface UpdatePreferencesRequest {
  theme?: ThemeMode;
  emailNotifications?: Partial<UserPreferences['emailNotifications']>;
  pushNotifications?: Partial<UserPreferences['pushNotifications']>;
}

// POST /api/users/me/avatar
// Upload avatar (multipart/form-data)
interface UploadAvatarResponse {
  url: string;
}

// POST /api/users/me/password
// Change password
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// POST /api/users/me/2fa/enable
// Enable two-factor authentication
interface Enable2FAResponse {
  qrCode: string;
  secret: string;
}

// POST /api/users/me/2fa/disable
// Disable two-factor authentication
```

#### Workspace Settings

```typescript
// GET /api/workspaces/:workspaceId
// Get workspace settings
interface GetWorkspaceResponse {
  general: WorkspaceGeneral;
  billing: BillingInfo;
  billingHistory: BillingHistory[];
}

// PATCH /api/workspaces/:workspaceId
// Update workspace settings
interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  defaultView?: DefaultView;
}

// POST /api/workspaces/:workspaceId/logo
// Upload workspace logo (multipart/form-data)
interface UploadLogoResponse {
  url: string;
}

// DELETE /api/workspaces/:workspaceId
// Delete workspace (requires owner role)
```

---

## 🔄 Real-time Updates

Use WebSocket for real-time member updates:

```tsx
import { useEffect } from 'react';
import { io } from 'socket.io-client';

function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const socket = io('wss://api.nexora.com');

    socket.on('connect', () => {
      socket.emit('subscribe', { workspaceId: '123' });
    });

    // Member joined workspace
    socket.on('member:joined', (member: TeamMember) => {
      setMembers((prev) => [...prev, member]);
      toast.success(`${member.name} joined the workspace`);
    });

    // Member left/removed
    socket.on('member:removed', (memberId: string) => {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    });

    // Member role changed
    socket.on('member:role-changed', (data: { memberId: string; newRole: MemberRole }) => {
      setMembers((prev) =>
        prev.map((m) => (m.id === data.memberId ? { ...m, role: data.newRole } : m))
      );
    });

    // Member status changed
    socket.on('member:status-changed', (data: { memberId: string; status: MemberStatus }) => {
      setMembers((prev) =>
        prev.map((m) => (m.id === data.memberId ? { ...m, status: data.status } : m))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ...
}
```

---

## 🎨 Styling & Theming

All components support dark mode and use Tailwind CSS classes:

```tsx
// Light mode
bg-white text-neutral-900

// Dark mode
dark:bg-neutral-900 dark:text-white

// Orange accent
bg-orange-500 hover:bg-orange-600
border-orange-500 text-orange-600

// Role colors
owner: bg-purple-100 text-purple-800
admin: bg-blue-100 text-blue-800
member: bg-green-100 text-green-800
guest: bg-neutral-100 text-neutral-800
```

### Custom Styling

```tsx
<TeamMembersGrid
  className="max-w-7xl mx-auto p-6"
  // ...
/>

<WorkspaceSettingsPanel
  className="container mx-auto my-8"
  // ...
/>
```

---

## ♿ Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Full keyboard support with Tab, Enter, Escape
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators, focus trap in modals
- **Color Contrast**: 4.5:1 minimum contrast ratio
- **Form Validation**: Clear error messages, validation feedback

```tsx
// Example: Form labels
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />

// Example: Button labels
<Button aria-label="Delete workspace">
  <Trash2 className="h-4 w-4" />
</Button>
```

---

## 📱 Responsive Design

All components are fully responsive:

```tsx
// Mobile: 1 column
// Tablet: 2 columns
// Desktop: 3 columns
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Mobile: Stack
// Desktop: Side by side
flex-col md:flex-row

// Responsive text sizes
text-sm md:text-base

// Responsive spacing
p-4 md:p-6 lg:p-8
```

---

## 🧪 Testing

### Unit Tests

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamMembersGrid } from '@nexora/ui';

describe('TeamMembersGrid', () => {
  it('renders members correctly', () => {
    const members = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', joinedAt: new Date() },
    ];

    render(<TeamMembersGrid members={members} currentUserId="user-123" />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('calls onInvite when invite button is clicked', async () => {
    const onInvite = jest.fn();

    render(
      <TeamMembersGrid
        members={[]}
        currentUserId="user-123"
        canInvite={true}
        onInvite={onInvite}
      />
    );

    fireEvent.click(screen.getByText('Invite Member'));

    expect(onInvite).toHaveBeenCalledTimes(1);
  });

  it('prevents editing of owner role', () => {
    const members = [
      { id: '1', name: 'Owner', email: 'owner@example.com', role: 'owner', status: 'active', joinedAt: new Date() },
    ];

    render(
      <TeamMembersGrid
        members={members}
        currentUserId="user-123"
        canEdit={true}
      />
    );

    // Actions dropdown should not show edit/remove for owner
    const actionsButton = screen.getByLabelText('Member actions');
    fireEvent.click(actionsButton);

    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });
});
```

### Integration Tests

```tsx
describe('Team Management Flow', () => {
  it('completes full invite workflow', async () => {
    const { user } = render(<TeamPage />);

    // Open invite modal
    await user.click(screen.getByText('Invite Member'));

    // Enter email
    const emailInput = screen.getByLabelText('Email addresses');
    await user.type(emailInput, 'newmember@example.com');
    await user.click(screen.getByText('Add'));

    // Select role
    await user.click(screen.getByText('Member'));

    // Submit
    await user.click(screen.getByText('Send 1 Invite'));

    // Verify success
    await waitFor(() => {
      expect(screen.getByText('Invited 1 member!')).toBeInTheDocument();
    });
  });
});
```

---

## 🚀 Complete Example

Full team management page with all components:

```tsx
'use client';

import { useState } from 'react';
import {
  TeamMembersGrid,
  InviteMemberModal,
  UserSettingsPanel,
  WorkspaceSettingsPanel,
  type TeamMember,
  type MemberRole,
} from '@nexora/ui';

export default function TeamManagementPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Sarah Anderson',
      email: 'sarah@example.com',
      avatar: 'https://...',
      role: 'owner',
      status: 'active',
      joinedAt: new Date('2024-01-15'),
      lastActive: new Date(),
    },
    {
      id: '2',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'admin',
      status: 'active',
      joinedAt: new Date('2024-02-01'),
      lastActive: new Date(Date.now() - 3600000),
    },
  ]);

  const currentUserId = 'user-123';
  const currentUserRole: MemberRole = 'owner';

  const handleInvite = async (
    emails: string[],
    role: InviteRole,
    message?: string
  ) => {
    const response = await fetch('/api/workspaces/123/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails, role, message }),
    });

    if (!response.ok) throw new Error('Failed to invite');

    const newMembers = await response.json();
    setMembers((prev) => [...prev, ...newMembers]);
  };

  const handleRemoveMember = async (memberId: string) => {
    await fetch(`/api/workspaces/123/members/${memberId}`, {
      method: 'DELETE',
    });

    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleChangeRole = async (memberId: string, newRole: MemberRole) => {
    await fetch(`/api/workspaces/123/members/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="container mx-auto py-8 px-4">
        <TeamMembersGrid
          members={members}
          currentUserId={currentUserId}
          canInvite={currentUserRole === 'owner' || currentUserRole === 'admin'}
          canEdit={currentUserRole === 'owner' || currentUserRole === 'admin'}
          canRemove={currentUserRole === 'owner' || currentUserRole === 'admin'}
          onInvite={() => setIsInviteOpen(true)}
          onRemoveMember={handleRemoveMember}
          onChangeRole={handleChangeRole}
        />

        <InviteMemberModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          onInvite={handleInvite}
          workspaceName="Acme Corp"
          inviteLink="https://app.nexora.com/invite/abc123"
        />
      </div>
    </div>
  );
}
```

---

## 📚 Additional Resources

- [Role-Based Access Control Guide](./PERMISSIONS_SYSTEM.md)
- [Real-time Collaboration](./REALTIME.md)
- [API Documentation](./API.md)
- [Component Library](./UI_UX_GUIDE.md)

---

## 🎯 Summary

The Team & Settings components provide:

✅ **Complete Team Management** - Member grid, role badges, status indicators  
✅ **Flexible Invite System** - Multi-email, role selection, link sharing  
✅ **Personal Settings** - Profile, preferences, security  
✅ **Workspace Configuration** - General, billing, danger zone  
✅ **Role-Based Access Control** - 4 roles with permission checks  
✅ **Real-time Updates** - WebSocket integration patterns  
✅ **Fully Accessible** - WCAG 2.1 Level AA compliant  
✅ **Responsive Design** - Mobile-first approach  
✅ **Dark Mode Support** - Automatic theme switching  
✅ **TypeScript First** - Full type safety
