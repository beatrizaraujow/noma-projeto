/// <reference types="cypress" />

describe('Workspace Dashboard Widgets', () => {
  const workspaceId = 'workspace-test';
  const storageKey = `dashboard-widgets-${workspaceId}`;
  const dashboardData = {
    overview: {
      totalProjects: 1,
      totalTasks: 2,
      totalMembers: 1,
      completedTasks: 1,
      overdueTasks: 0,
      completionRate: 50,
    },
    recentActivity: [],
  };

  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '**/api/analytics/workspaces/*/dashboard' },
      { statusCode: 200, body: dashboardData }
    );

    cy.visit(`/workspaces/${workspaceId}/dashboard`, {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          storageKey,
          JSON.stringify([
            { id: 'overview', enabled: true },
            { id: 'project-progress', enabled: false },
            { id: 'team-productivity', enabled: false },
            { id: 'weekly-productivity', enabled: false },
            { id: 'activation-checklist', enabled: false },
            { id: 'activation-funnel', enabled: false },
          ])
        );
      },
    });
  });

  it('persists hidden widget state after page reload', () => {
    cy.get('[data-testid="dashboard-customize-toggle"]').click();

    cy.get('[data-testid="widget-visibility-overview"]')
      .should('be.visible')
      .and('contain.text', 'Hide')
      .click();

    cy.get('[data-testid="widget-visibility-overview"]').should('contain.text', 'Show');

    cy.reload();
    cy.get('[data-testid="dashboard-customize-toggle"]').click();

    cy.get('[data-testid="widget-visibility-overview"]').should('contain.text', 'Show');
  });
});
