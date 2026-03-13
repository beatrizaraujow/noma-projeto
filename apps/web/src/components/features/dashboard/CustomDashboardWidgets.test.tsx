import '@testing-library/jest-dom/jest-globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest as jestGlobals } from '@jest/globals';

jestGlobals.mock('@/components/common', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jestGlobals.mock('@/components/features/workspace', () => ({
  WorkspaceDashboard: () => <div data-testid="widget-overview">overview</div>,
}));

jestGlobals.mock('@/components/features/projects', () => ({
  ProjectProgressTracker: () => (
    <div data-testid="widget-project-progress">project-progress</div>
  ),
}));

jestGlobals.mock('./TeamProductivityMetrics', () => () => (
  <div data-testid="widget-team-productivity">team-productivity</div>
));

jestGlobals.mock('./WeeklyProductivityChart', () => () => (
  <div data-testid="widget-weekly-productivity">weekly-productivity</div>
));

jestGlobals.mock('./ActivationFunnelWidget', () => () => (
  <div data-testid="widget-activation-funnel">activation-funnel</div>
));

jestGlobals.mock('./ActivationChecklistWidget', () => () => (
  <div data-testid="widget-activation-checklist">activation-checklist</div>
));

jestGlobals.mock('./SignupMetricsWidget', () => () => (
  <div data-testid="widget-signup-metrics">signup-metrics</div>
));

const CustomDashboardWidgets = require('./CustomDashboardWidgets').default;

const workspaceId = 'workspace-1';
const token = 'token';
const storageKey = `dashboard-widgets-${workspaceId}`;

function renderComponent() {
  return render(<CustomDashboardWidgets workspaceId={workspaceId} token={token} />);
}

describe('CustomDashboardWidgets', () => {
  beforeEach(() => {
    localStorage.clear();
    jestGlobals.restoreAllMocks();
  });

  it('renders all widgets by default', () => {
    renderComponent();

    expect(screen.getByTestId('widget-overview')).toBeInTheDocument();
    expect(screen.getByTestId('widget-project-progress')).toBeInTheDocument();
    expect(screen.getByTestId('widget-team-productivity')).toBeInTheDocument();
    expect(screen.getByTestId('widget-weekly-productivity')).toBeInTheDocument();
    expect(screen.getByTestId('widget-activation-funnel')).toBeInTheDocument();
    expect(screen.getByTestId('widget-activation-checklist')).toBeInTheDocument();
    expect(screen.getByTestId('widget-signup-metrics')).toBeInTheDocument();
  });

  it('uses saved widget visibility from localStorage', () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        { id: 'overview', enabled: false },
        { id: 'project-progress', enabled: true },
      ])
    );

    renderComponent();

    expect(screen.queryByTestId('widget-overview')).not.toBeInTheDocument();
    expect(screen.getByTestId('widget-project-progress')).toBeInTheDocument();
    expect(screen.getByTestId('widget-team-productivity')).toBeInTheDocument();
  });

  it('clears invalid localStorage payload and falls back to defaults', () => {
    const removeItemSpy = jestGlobals.spyOn(Storage.prototype, 'removeItem');
    localStorage.setItem(storageKey, '{invalid-json');

    renderComponent();

    expect(removeItemSpy).toHaveBeenCalledWith(storageKey);
    expect(screen.getByTestId('widget-overview')).toBeInTheDocument();
  });

  it('toggles widget visibility and persists change', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Hide' })[0]);

    expect(screen.queryByTestId('widget-overview')).not.toBeInTheDocument();

    const savedWidgets = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    expect(savedWidgets.find((widget: any) => widget.id === 'overview')?.enabled).toBe(
      false
    );
  });

  it('moves widget down and persists order', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    fireEvent.click(screen.getAllByRole('button', { name: '↓' })[0]);

    const savedWidgets = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    expect(savedWidgets[0].id).toBe('project-progress');
    expect(savedWidgets[1].id).toBe('overview');
  });

  it('restores widget order from localStorage on initial render', () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        { id: 'project-progress', enabled: true },
        { id: 'overview', enabled: true },
        { id: 'team-productivity', enabled: true },
        { id: 'weekly-productivity', enabled: true },
        { id: 'activation-funnel', enabled: true },
        { id: 'activation-checklist', enabled: true },
      ])
    );

    renderComponent();

    const widgetNodes = screen.getAllByTestId(/widget-/);
    expect(widgetNodes[0]).toHaveAttribute('data-testid', 'widget-project-progress');
    expect(widgetNodes[1]).toHaveAttribute('data-testid', 'widget-overview');
  });

  it('does not persist when moving first widget up', () => {
    const setItemSpy = jestGlobals.spyOn(Storage.prototype, 'setItem');
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    fireEvent.click(screen.getAllByRole('button', { name: '↑' })[0]);

    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
