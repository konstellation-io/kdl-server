describe('Projects Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001');
  });

  it('should show projects page', () => {
    cy.url().should('include', '/projects');
  });

  it('should go to the project overview page when click on a project', () => {
    cy.get('[data-test-id="project"]').first().as('firstProject');

    cy.get('@firstProject')
      .invoke('attr', 'href')
      .then((href) => {
        cy.get('@firstProject').click();
        cy.url().should('include', href).and('include', '/overview');
      });
  });

  it('should go to the create project page when click on the last project', () => {
    cy.get('[data-test-id="addProject"]').as('lastProject');

    cy.get('@lastProject')
      .invoke('attr', 'href')
      .then((href) => {
        cy.get('@lastProject').click();
        cy.url().should('include', href);
      });
  });

  it('should show only archived projects', () => {
    cy.get('[data-test-id="filterProject"]')
      .click()
      .then(($filter) => {
        cy.get('div', { withinSubject: $filter }).contains('Archived').click();
        cy.get('[data-test-id="project"]').each(($project) => {
          expect($project).to.contain('ARCHIVED');
        });
      });
  });
});
