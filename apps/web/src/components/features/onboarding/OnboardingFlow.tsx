/**
 * Onboarding Flow - Welcome tour for new users
 */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startOnboarding: (steps: OnboardingStep[]) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);

  const startOnboarding = (newSteps: OnboardingStep[]) => {
    setSteps(newSteps);
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const skipOnboarding = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('onboarding_completed', 'skipped');
  };

  const completeOnboarding = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('onboarding_completed', 'true');
  };

  // Check if onboarding was already completed
  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    if (!completed && steps.length > 0) {
      // Auto start onboarding for first-time users
    }
  }, [steps]);

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startOnboarding,
        nextStep,
        previousStep,
        skipOnboarding,
        completeOnboarding,
      }}
    >
      {children}
      {isActive && <OnboardingOverlay />}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

function OnboardingOverlay() {
  const { currentStep, steps, nextStep, previousStep, skipOnboarding } = useOnboarding();
  const step = steps[currentStep];

  if (!step) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1500] animate-fade-in" />

      {/* Spotlight */}
      {step.targetElement && (
        <div
          className="fixed z-[1501] pointer-events-none"
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          }}
        />
      )}

      {/* Tooltip */}
      <div className="fixed z-[1502] max-w-md animate-slide-in-bottom">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Passo {currentStep + 1} de {steps.length}
              </p>
            </div>
            <button
              onClick={skipOnboarding}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-700 dark:text-gray-300">{step.description}</p>

          {/* Action */}
          {step.action && (
            <button
              onClick={step.action.onClick}
              className="w-full px-4 py-2 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/30 transition-colors"
            >
              {step.action.label}
            </button>
          )}

          {/* Progress */}
          <div className="flex items-center gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  i === currentStep
                    ? 'bg-primary-600'
                    : i < currentStep
                    ? 'bg-primary-400'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={previousStep}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Anterior
              </button>
            )}
            <button
              onClick={nextStep}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Welcome Modal - First-time user welcome
 */
export function WelcomeModal({
  isOpen,
  onClose,
  onStartTour,
}: {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8 space-y-6 animate-scale-in">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
            <span className="text-4xl">🚀</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bem-vindo ao NUMA!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Sua nova ferramenta de gerenciamento de projetos
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4">
          <Feature
            icon="📋"
            title="Organize"
            description="Gerencie projetos e tarefas em um só lugar"
          />
          <Feature
            icon="👥"
            title="Colabore"
            description="Trabalhe em equipe em tempo real"
          />
          <Feature
            icon="📊"
            title="Acompanhe"
            description="Monitore o progresso de forma visual"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Explorar por conta
          </button>
          <button
            onClick={onStartTour}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Fazer o tour guiado
          </button>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center space-y-2">
      <div className="text-3xl">{icon}</div>
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

/**
 * Default onboarding steps
 */
export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao NUMA!',
    description: 'Vamos fazer um tour rápido pelas principais funcionalidades.',
  },
  {
    id: 'workspaces',
    title: 'Workspaces',
    description: 'Organize seu trabalho em diferentes espaços. Cada workspace pode conter múltiplos projetos.',
    targetElement: '#workspaces-sidebar',
  },
  {
    id: 'projects',
    title: 'Projetos',
    description: 'Crie projetos para dividir seu trabalho em partes gerenciáveis.',
    targetElement: '#projects-list',
  },
  {
    id: 'tasks',
    title: 'Tarefas',
    description: 'Adicione tarefas aos seus projetos e organize-as por status.',
    targetElement: '#tasks-board',
  },
  {
    id: 'notifications',
    title: 'Notificações',
    description: 'Fique por dentro de todas as atualizações importantes do seu time.',
    targetElement: '#notifications-bell',
  },
];
