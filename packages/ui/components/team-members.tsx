import * as React from 'react';
import { UserPlus, MoreVertical, Mail, Shield, User, Trash2, Edit, Crown, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Avatar } from './avatar';
import { Badge } from './badge';
import { Button } from './button';
import { Dropdown, DropdownItem } from './dropdown';

export type MemberRole = 'owner' | 'admin' | 'member' | 'guest';
export type MemberStatus = 'active' | 'pending' | 'invited';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt?: Date;
  lastActive?: Date;
}

export interface TeamMembersGridProps {
  members: TeamMember[];
  currentUserId?: string;
  canInvite?: boolean;
  canEdit?: boolean;
  canRemove?: boolean;
  onInvite?: () => void;
  onEditMember?: (member: TeamMember) => void;
  onRemoveMember?: (member: TeamMember) => void;
  onChangeRole?: (memberId: string, newRole: MemberRole) => void;
  onResendInvite?: (memberId: string) => void;
  className?: string;
}

const roleConfig: Record<MemberRole, { label: string; color: string; icon: React.ReactNode; description: string }> = {
  owner: {
    label: 'Owner',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
    icon: <Crown className="h-3 w-3" />,
    description: 'Full access and ownership',
  },
  admin: {
    label: 'Admin',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    icon: <Shield className="h-3 w-3" />,
    description: 'Can manage members and settings',
  },
  member: {
    label: 'Member',
    color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    icon: <User className="h-3 w-3" />,
    description: 'Can view and edit content',
  },
  guest: {
    label: 'Guest',
    color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400',
    icon: <User className="h-3 w-3" />,
    description: 'Limited access to specific content',
  },
};

export const TeamMembersGrid = React.forwardRef<HTMLDivElement, TeamMembersGridProps>(
  (
    {
      members,
      currentUserId,
      canInvite = true,
      canEdit = true,
      canRemove = true,
      onInvite,
      onEditMember,
      onRemoveMember,
      onChangeRole,
      onResendInvite,
      className,
    },
    ref
  ) => {
    const getStatusBadge = (status: MemberStatus) => {
      switch (status) {
        case 'pending':
          return (
            <Badge variant="warning" className="text-xs">
              Pending
            </Badge>
          );
        case 'invited':
          return (
            <Badge variant="default" className="text-xs">
              Invited
            </Badge>
          );
        default:
          return null;
      }
    };

    const getRelativeTime = (date?: Date) => {
      if (!date) return null;
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days} days ago`;
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
      if (days < 365) return `${Math.floor(days / 30)} months ago`;
      return `${Math.floor(days / 365)} years ago`;
    };

    const canEditMember = (member: TeamMember) => {
      if (!canEdit) return false;
      if (member.id === currentUserId) return false;
      if (member.role === 'owner') return false;
      return true;
    };

    const canRemoveMember = (member: TeamMember) => {
      if (!canRemove) return false;
      if (member.id === currentUserId) return false;
      if (member.role === 'owner') return false;
      return true;
    };

    return (
      <div ref={ref} className={cn('space-y-4', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Team Members
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </p>
          </div>
          {canInvite && onInvite && (
            <Button onClick={onInvite} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          )}
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const role = roleConfig[member.role];
            const isCurrentUser = member.id === currentUserId;
            
            return (
              <div
                key={member.id}
                className={cn(
                  'p-4 rounded-lg border',
                  'bg-white dark:bg-neutral-900',
                  'border-neutral-200 dark:border-neutral-800',
                  isCurrentUser && 'ring-2 ring-orange-500 dark:ring-orange-600'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <Avatar
                    src={member.avatar}
                    fallback={member.name}
                    size="md"
                    className="flex-shrink-0"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                          {member.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                              (You)
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {member.email}
                        </p>
                      </div>

                      {/* Actions Dropdown */}
                      {(canEditMember(member) || canRemoveMember(member)) && (
                        <Dropdown
                          trigger={
                            <button
                              className={cn(
                                'p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800',
                                'text-neutral-500 dark:text-neutral-400'
                              )}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          }
                        >
                          {member.status === 'invited' && onResendInvite && (
                            <DropdownItem
                              leftIcon={<Mail className="h-4 w-4" />}
                              onClick={() => onResendInvite(member.id)}
                            >
                              Resend Invite
                            </DropdownItem>
                          )}
                          {canEditMember(member) && onChangeRole && (
                            <>
                              <DropdownItem
                                leftIcon={<Shield className="h-4 w-4" />}
                                onClick={() => onChangeRole(member.id, 'admin')}
                              >
                                Make Admin
                              </DropdownItem>
                              <DropdownItem
                                leftIcon={<User className="h-4 w-4" />}
                                onClick={() => onChangeRole(member.id, 'member')}
                              >
                                Make Member
                              </DropdownItem>
                            </>
                          )}
                          {canEditMember(member) && onEditMember && (
                            <DropdownItem
                              leftIcon={<Edit className="h-4 w-4" />}
                              onClick={() => onEditMember(member)}
                            >
                              Edit
                            </DropdownItem>
                          )}
                          {canRemoveMember(member) && onRemoveMember && (
                            <DropdownItem
                              leftIcon={<Trash2 className="h-4 w-4" />}
                              onClick={() => onRemoveMember(member)}
                              danger
                            >
                              Remove
                            </DropdownItem>
                          )}
                        </Dropdown>
                      )}
                    </div>

                    {/* Role Badge */}
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
                          role.color
                        )}
                      >
                        {role.icon}
                        {role.label}
                      </div>
                      {getStatusBadge(member.status)}
                    </div>

                    {/* Meta Info */}
                    <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                        {member.joinedAt && (
                          <span>Joined {getRelativeTime(member.joinedAt)}</span>
                        )}
                        {member.lastActive && member.status === 'active' && (
                          <span className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Active {getRelativeTime(member.lastActive)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {members.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="h-12 w-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
              No team members yet
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Invite your first team member to get started
            </p>
            {canInvite && onInvite && (
              <Button onClick={onInvite} size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

TeamMembersGrid.displayName = 'TeamMembersGrid';
