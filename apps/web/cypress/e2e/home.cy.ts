describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the main heading', () => {
    cy.contains('NexORA').should('be.visible');
  });

  it('should have navigation to dashboard', () => {
    cy.contains('Acessar Dashboard').should('be.visible');
  });

  it('should display features cards', () => {
    cy.contains('Real-time').should('be.visible');
    cy.contains('IA Integrada').should('be.visible');
    cy.contains('Analytics').should('be.visible');
  });
});
