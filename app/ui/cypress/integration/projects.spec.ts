describe('Projects Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001');
  });

  it('should show projects page', () => {
    cy.url().should('include', '/projects');
  });
});
