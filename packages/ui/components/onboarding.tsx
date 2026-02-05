import * as React from 'react';
import { Check, ChevronRight, ChevronLeft, Sparkles, Users, FolderKanban, Mail, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Input } from './input-new';
import { Textarea } from './textarea';

// Onboarding Container
export interface OnboardingContainerProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const OnboardingContainer = React.forwardRef<HTMLDivElement, OnboardingContainerProps>(
  ({ children, currentStep, totalSteps, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        'min-h-screen flex flex-col items-center justify-center p-4',
        'bg-gradient-to-br from-orange-50 via-white to-red-50',
        className
      )}
    >
      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <React.Fragment key={index}>
              <div
                className={cn(
                  'flex-1 h-2 rounded-full transition-all',
                  index < currentStep
                    ? 'bg-orange-600'
                    : index === currentStep
                    ? 'bg-orange-400'
                    : 'bg-neutral-200'
                )}
              />
            </React.Fragment>
          ))}
        </div>
        <div className="mt-2 text-sm text-neutral-600 text-center">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-2xl">
        {children}
      </div>
    </div>
  )
);

OnboardingContainer.displayName = 'OnboardingContainer';

// Onboarding Card
export interface OnboardingCardProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export const OnboardingCard = React.forwardRef<HTMLDivElement, OnboardingCardProps>(
  ({ children, icon, title, subtitle, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white rounded-2xl shadow-lg p-8 md:p-12',
        className
      )}
    >
      {icon && (
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-neutral-600 text-lg">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  )
);

OnboardingCard.displayName = 'OnboardingCard';

// Welcome Step
export interface WelcomeStepProps {
  onNext: () => void;
  userName?: string;
  className?: string;
}

export const WelcomeStep = React.forwardRef<HTMLDivElement, WelcomeStepProps>(
  ({ onNext, userName, className }, ref) => (
    <OnboardingCard
      ref={ref}
      icon={<Sparkles className="h-8 w-8 text-orange-600" />}
      title={userName ? `Welcome, ${userName}! 👋` : 'Welcome to NOMA! 👋'}
      subtitle="Let's get you set up in just a few steps"
      className={className}
    >
      <div className="space-y-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 mb-1">Create your workspace</h3>
            <p className="text-neutral-600 text-sm">
              Set up a workspace for your team to collaborate
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 mb-1">Invite your team</h3>
            <p className="text-neutral-600 text-sm">
              Add team members to start collaborating
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 mb-1">Create your first project</h3>
            <p className="text-neutral-600 text-sm">
              Start organizing your work right away
            </p>
          </div>
        </div>
      </div>

      <Button
        onClick={onNext}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        size="lg"
      >
        Get Started
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>

      <p className="text-center text-sm text-neutral-500 mt-4">
        Takes less than 2 minutes
      </p>
    </OnboardingCard>
  )
);

WelcomeStep.displayName = 'WelcomeStep';

// Create Workspace Step
export interface CreateWorkspaceStepProps {
  onNext: (data: { name: string; description?: string }) => void | Promise<void>;
  onBack: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const CreateWorkspaceStep = React.forwardRef<HTMLDivElement, CreateWorkspaceStepProps>(
  ({ onNext, onBack, loading = false, error, className }, ref) => {
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await onNext({ name, description });
    };

    return (
      <OnboardingCard
        ref={ref}
        icon={<FolderKanban className="h-8 w-8 text-orange-600" />}
        title="Create your workspace"
        subtitle="A workspace is where your team collaborates on projects"
        className={className}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Workspace name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g., Acme Inc, Marketing Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description <span className="text-neutral-400">(optional)</span>
            </label>
            <Textarea
              placeholder="What's this workspace for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={loading}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              disabled={loading || !name}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </OnboardingCard>
    );
  }
);

CreateWorkspaceStep.displayName = 'CreateWorkspaceStep';

// Invite Team Step
export interface InviteTeamStepProps {
  onNext: (emails: string[]) => void | Promise<void>;
  onSkip: () => void;
  onBack: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const InviteTeamStep = React.forwardRef<HTMLDivElement, InviteTeamStepProps>(
  ({ onNext, onSkip, onBack, loading = false, error, className }, ref) => {
    const [emails, setEmails] = React.useState(['', '', '']);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const validEmails = emails.filter(email => email.trim() !== '');
      await onNext(validEmails);
    };

    const updateEmail = (index: number, value: string) => {
      const newEmails = [...emails];
      newEmails[index] = value;
      setEmails(newEmails);
    };

    const hasValidEmails = emails.some(email => email.trim() !== '');

    return (
      <OnboardingCard
        ref={ref}
        icon={<Users className="h-8 w-8 text-orange-600" />}
        title="Invite your team"
        subtitle="Collaborate better by inviting team members"
        className={className}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {emails.map((email, index) => (
              <Input
                key={index}
                type="email"
                placeholder={`teammate${index + 1}@example.com`}
                value={email}
                onChange={(e) => updateEmail(index, e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                disabled={loading}
              />
            ))}
          </div>

          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-sm text-orange-800">
              💡 <strong>Tip:</strong> You can always invite more people later from workspace settings
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              disabled={loading}
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={loading || !hasValidEmails}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  Send Invites
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </OnboardingCard>
    );
  }
);

InviteTeamStep.displayName = 'InviteTeamStep';

// Create Project Step
export interface CreateProjectStepProps {
  onNext: (data: { name: string; description?: string }) => void | Promise<void>;
  onSkip: () => void;
  onBack: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const CreateProjectStep = React.forwardRef<HTMLDivElement, CreateProjectStepProps>(
  ({ onNext, onSkip, onBack, loading = false, error, className }, ref) => {
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await onNext({ name, description });
    };

    return (
      <OnboardingCard
        ref={ref}
        icon={<FolderKanban className="h-8 w-8 text-orange-600" />}
        title="Create your first project"
        subtitle="Projects help you organize and track work"
        className={className}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Project name
            </label>
            <Input
              type="text"
              placeholder="e.g., Website Redesign, Q1 Campaign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description <span className="text-neutral-400">(optional)</span>
            </label>
            <Textarea
              placeholder="What's this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              disabled={loading}
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={loading || !name}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Finish & Launch 🚀'
              )}
            </Button>
          </div>
        </form>
      </OnboardingCard>
    );
  }
);

CreateProjectStep.displayName = 'CreateProjectStep';
