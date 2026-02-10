import * as React from 'react';
import { X, Mail, UserPlus, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';

export type InviteRole = 'admin' | 'member' | 'guest';

export interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (emails: string[], role: InviteRole, message?: string) => Promise<void>;
  workspaceName?: string;
  inviteLink?: string;
  className?: string;
}

export const InviteMemberModal = React.forwardRef<HTMLDivElement, InviteMemberModalProps>(
  ({ isOpen, onClose, onInvite, workspaceName, inviteLink, className }, ref) => {
    const [emails, setEmails] = React.useState<string[]>([]);
    const [emailInput, setEmailInput] = React.useState('');
    const [role, setRole] = React.useState<InviteRole>('member');
    const [message, setMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [linkCopied, setLinkCopied] = React.useState(false);

    const inputRef = React.useRef<HTMLInputElement>(null);

    // Reset state when modal closes
    React.useEffect(() => {
      if (!isOpen) {
        setEmails([]);
        setEmailInput('');
        setRole('member');
        setMessage('');
        setIsLoading(false);
        setLinkCopied(false);
      }
    }, [isOpen]);

    // Focus input when modal opens
    React.useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen]);

    const validateEmail = (email: string): boolean => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

    const handleAddEmail = () => {
      const trimmedEmail = emailInput.trim();
      if (!trimmedEmail) return;

      if (!validateEmail(trimmedEmail)) {
        alert('Please enter a valid email address');
        return;
      }

      if (emails.includes(trimmedEmail)) {
        alert('This email has already been added');
        return;
      }

      setEmails([...emails, trimmedEmail]);
      setEmailInput('');
    };

    const handleRemoveEmail = (email: string) => {
      setEmails(emails.filter((e) => e !== email));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddEmail();
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (emails.length === 0) {
        alert('Please add at least one email address');
        return;
      }

      setIsLoading(true);
      try {
        await onInvite(emails, role, message || undefined);
        onClose();
      } catch (error) {
        console.error('Failed to send invites:', error);
        alert('Failed to send invites. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const handleCopyLink = async () => {
      if (!inviteLink) return;
      
      try {
        await navigator.clipboard.writeText(inviteLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    };

    if (!isOpen) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            ref={ref}
            className={cn(
              'w-full max-w-2xl',
              'bg-white dark:bg-neutral-900',
              'rounded-lg shadow-xl',
              'animate-in fade-in zoom-in-95',
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Invite Team Members
                </h2>
                {workspaceName && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    to {workspaceName}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Email Input */}
              <div>
                <Label htmlFor="email-input">Email Addresses</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    ref={inputRef}
                    id="email-input"
                    type="email"
                    placeholder="colleague@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    onClick={handleAddEmail}
                    disabled={!emailInput.trim() || isLoading}
                    variant="secondary"
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Press Enter or click Add to add multiple emails
                </p>
              </div>

              {/* Email Chips */}
              {emails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {emails.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="pl-3 pr-2 py-1.5 text-sm"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="ml-2 hover:text-neutral-900 dark:hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Role Selection */}
              <div>
                <Label>Role</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {(['admin', 'member', 'guest'] as InviteRole[]).map((roleOption) => (
                    <button
                      key={roleOption}
                      type="button"
                      onClick={() => setRole(roleOption)}
                      className={cn(
                        'p-3 rounded-lg border-2 text-left transition-colors',
                        role === roleOption
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                      )}
                      disabled={isLoading}
                    >
                      <div className="font-medium text-sm text-neutral-900 dark:text-white capitalize">
                        {roleOption}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {roleOption === 'admin' && 'Can manage members'}
                        {roleOption === 'member' && 'Can edit content'}
                        {roleOption === 'guest' && 'View only access'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <Label htmlFor="invite-message">Personal Message (Optional)</Label>
                <textarea
                  id="invite-message"
                  rows={3}
                  placeholder="Add a personal note to your invitation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isLoading}
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

              {/* Invite Link */}
              {inviteLink && (
                <div>
                  <Label>Or Share Invite Link</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="flex-1 font-mono text-xs"
                    />
                    <Button
                      type="button"
                      onClick={handleCopyLink}
                      variant="secondary"
                      size="sm"
                    >
                      {linkCopied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Anyone with this link can join as a {role}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={emails.length === 0 || isLoading}>
                  <Mail className="h-4 w-4 mr-2" />
                  {isLoading ? 'Sending...' : `Send ${emails.length} Invite${emails.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }
);

InviteMemberModal.displayName = 'InviteMemberModal';
