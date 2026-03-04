import * as React from 'react';
import {
  Settings,
  CreditCard,
  AlertTriangle,
  Upload,
  Save,
  Check,
  Trash2,
  Building2,
  Users,
  FolderKanban,
  HardDrive,
  Eye,
  LayoutGrid,
  List,
  Calendar,
  GanttChart,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';

export type WorkspaceSettingsTab = 'general' | 'billing' | 'danger-zone';
export type PlanType = 'free' | 'pro' | 'enterprise';
export type DefaultView = 'board' | 'list' | 'calendar' | 'timeline';

export interface WorkspaceGeneral {
  name: string;
  description?: string;
  logo?: string;
  defaultView: DefaultView;
}

export interface BillingInfo {
  plan: PlanType;
  memberCount: number;
  projectCount: number;
  storageUsed: number;
  storageLimit: number;
}

export interface BillingHistory {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoice?: string;
}

export interface WorkspaceSettingsPanelProps {
  general: WorkspaceGeneral;
  billing: BillingInfo;
  billingHistory?: BillingHistory[];
  activeTab?: WorkspaceSettingsTab;
  canManageBilling?: boolean;
  canDeleteWorkspace?: boolean;
  onTabChange?: (tab: WorkspaceSettingsTab) => void;
  onUpdateGeneral?: (general: Partial<WorkspaceGeneral>) => Promise<void>;
  onUploadLogo?: (file: File) => Promise<string>;
  onUpgradePlan?: () => void;
  onDeleteWorkspace?: () => Promise<void>;
  className?: string;
}

export const WorkspaceSettingsPanel = React.forwardRef<HTMLDivElement, WorkspaceSettingsPanelProps>(
  (
    {
      general,
      billing,
      billingHistory = [],
      activeTab = 'general',
      canManageBilling = false,
      canDeleteWorkspace = false,
      onTabChange,
      onUpdateGeneral,
      onUploadLogo,
      onUpgradePlan,
      onDeleteWorkspace,
      className,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('max-w-4xl mx-auto', className)}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Workspace Settings
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage workspace configuration and billing
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-neutral-200 dark:border-neutral-800">
          {[
            { id: 'general' as WorkspaceSettingsTab, label: 'General', icon: Settings },
            { id: 'billing' as WorkspaceSettingsTab, label: 'Billing & Usage', icon: CreditCard },
            { id: 'danger-zone' as WorkspaceSettingsTab, label: 'Danger Zone', icon: AlertTriangle },
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
          {activeTab === 'general' && (
            <GeneralTab
              general={general}
              onUpdate={onUpdateGeneral}
              onUploadLogo={onUploadLogo}
            />
          )}
          {activeTab === 'billing' && (
            <BillingTab
              billing={billing}
              billingHistory={billingHistory}
              canManage={canManageBilling}
              onUpgrade={onUpgradePlan}
            />
          )}
          {activeTab === 'danger-zone' && (
            <DangerZoneTab
              workspaceName={general.name}
              canDelete={canDeleteWorkspace}
              onDelete={onDeleteWorkspace}
            />
          )}
        </div>
      </div>
    );
  }
);

WorkspaceSettingsPanel.displayName = 'WorkspaceSettingsPanel';

// General Tab Component
interface GeneralTabProps {
  general: WorkspaceGeneral;
  onUpdate?: (general: Partial<WorkspaceGeneral>) => Promise<void>;
  onUploadLogo?: (file: File) => Promise<string>;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ general, onUpdate, onUploadLogo }) => {
  const [formData, setFormData] = React.useState(general);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof WorkspaceGeneral, value: string) => {
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
      console.error('Failed to update workspace:', error);
      alert('Failed to update workspace settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadLogo) return;

    setIsLoading(true);
    try {
      const logoUrl = await onUploadLogo(file);
      setFormData((prev) => ({ ...prev, logo: logoUrl }));
      setIsSaved(false);
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert('Failed to upload logo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Workspace Logo */}
      <div>
        <Label>Workspace Logo</Label>
        <div className="flex items-center gap-6 mt-2">
          <div className="w-20 h-20 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
            {formData.logo ? (
              <img src={formData.logo} alt="Workspace logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="h-8 w-8 text-neutral-400" />
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
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
              Upload Logo
            </Button>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Square image, PNG or JPG. Max 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Name */}
      <div>
        <Label htmlFor="workspace-name">Workspace Name</Label>
        <Input
          id="workspace-name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={isLoading}
          className="mt-2"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="workspace-description">Description</Label>
        <textarea
          id="workspace-description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe what this workspace is for..."
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

      {/* Default View */}
      <div>
        <Label>Default View</Label>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-3">
          Choose the default view for projects in this workspace
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'board' as DefaultView, label: 'Board', icon: LayoutGrid },
            { id: 'list' as DefaultView, label: 'List', icon: List },
            { id: 'calendar' as DefaultView, label: 'Calendar', icon: Calendar },
            { id: 'timeline' as DefaultView, label: 'Timeline', icon: GanttChart },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleChange('defaultView', id)}
              className={cn(
                'p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors',
                formData.defaultView === id
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              )}
              disabled={isLoading}
            >
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium">{label}</span>
            </button>
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

// Billing Tab Component
interface BillingTabProps {
  billing: BillingInfo;
  billingHistory: BillingHistory[];
  canManage: boolean;
  onUpgrade?: () => void;
}

const BillingTab: React.FC<BillingTabProps> = ({ billing, billingHistory, canManage, onUpgrade }) => {
  const getPlanBadge = (plan: PlanType) => {
    const config = {
      free: { label: 'Free', variant: 'default' as const },
      pro: { label: 'Pro', variant: 'success' as const },
      enterprise: { label: 'Enterprise', variant: 'primary' as const },
    };
    return config[plan];
  };

  const planInfo = getPlanBadge(billing.plan);
  const storagePercentage = (billing.storageUsed / billing.storageLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Current Plan
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Your workspace subscription
            </p>
          </div>
          <Badge variant={planInfo.variant}>{planInfo.label}</Badge>
        </div>

        {billing.plan === 'free' && canManage && (
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
              Upgrade to Pro to unlock unlimited projects, advanced analytics, and priority support.
            </p>
            <Button onClick={onUpgrade} size="sm">
              Upgrade to Pro
            </Button>
          </div>
        )}
      </div>

      {/* Usage Stats */}
      <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Usage Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Members */}
          <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">Members</div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {billing.memberCount}
                </div>
              </div>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {billing.plan === 'free' && 'Up to 5 on Free plan'}
              {billing.plan === 'pro' && 'Up to 25 on Pro plan'}
              {billing.plan === 'enterprise' && 'Unlimited'}
            </div>
          </div>

          {/* Projects */}
          <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg">
                <FolderKanban className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">Projects</div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {billing.projectCount}
                </div>
              </div>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {billing.plan === 'free' && 'Up to 3 on Free plan'}
              {billing.plan === 'pro' && 'Unlimited on Pro plan'}
              {billing.plan === 'enterprise' && 'Unlimited'}
            </div>
          </div>

          {/* Storage */}
          <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
                <HardDrive className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">Storage</div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {billing.storageUsed}GB
                </div>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                <span>{storagePercentage.toFixed(0)}% used</span>
                <span>{billing.storageLimit}GB</span>
              </div>
              <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all',
                    storagePercentage > 90 ? 'bg-red-500' : storagePercentage > 70 ? 'bg-orange-500' : 'bg-green-500'
                  )}
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Billing History
        </h3>
        {billingHistory.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            No billing history yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-900 dark:text-white">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-900 dark:text-white">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-900 dark:text-white">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-neutral-900 dark:text-white">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-200 dark:border-neutral-700">
                    <td className="py-3 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                      {item.date.toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                      ${item.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          item.status === 'paid' ? 'success' : item.status === 'pending' ? 'default' : 'danger'
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.invoice ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(item.invoice as string, '_blank', 'noopener,noreferrer')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-neutral-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Danger Zone Tab Component
interface DangerZoneTabProps {
  workspaceName: string;
  canDelete: boolean;
  onDelete?: () => Promise<void>;
}

const DangerZoneTab: React.FC<DangerZoneTabProps> = ({ workspaceName, canDelete, onDelete }) => {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (confirmText !== workspaceName) {
      alert('Workspace name does not match');
      return;
    }

    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      alert('Failed to delete workspace');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">
            Danger Zone
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Actions in this section are irreversible. Please proceed with caution.
          </p>
        </div>
      </div>

      {/* Delete Workspace */}
      <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg border-2 border-red-200 dark:border-red-800">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          Delete Workspace
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Once you delete a workspace, there is no going back. This will permanently delete:
        </p>
        <ul className="list-disc list-inside text-sm text-neutral-600 dark:text-neutral-400 space-y-1 mb-4">
          <li>All projects and tasks</li>
          <li>All comments and attachments</li>
          <li>All team member access</li>
          <li>All workspace data</li>
        </ul>

        {!canDelete && (
          <div className="mb-4 p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Only the workspace owner can delete this workspace.
            </p>
          </div>
        )}

        {!showConfirmation ? (
          <Button
            variant="danger"
            onClick={() => setShowConfirmation(true)}
            disabled={!canDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete This Workspace
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="confirm-delete">
                Type <strong>{workspaceName}</strong> to confirm
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={workspaceName}
                disabled={isDeleting}
                className="mt-2"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={confirmText !== workspaceName || isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'I understand, delete this workspace'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowConfirmation(false);
                  setConfirmText('');
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
