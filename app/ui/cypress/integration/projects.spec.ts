const { _ } = Cypress;

describe('Projects Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001');
  });

  it('should show projects page', () => {
    // Assert.
    cy.url().should('include', '/projects');
  });

  it('should show at least 4 projects in the page', () => {
    // Assert.
    cy.get('[data-testid="project"]').should('have.length.at.least', 4);
  });

  it('should show 8 projects when filtering by all', () => {
    // Act.
    cy.get('[data-testid="filterProjects"]')
      .click()
      .contains('all', { matchCase: false })
      .click();

    // Assert.
    cy.get('[data-testid="project"]').should('have.length.at.least', 8);
  });

  it('should show only archived projects when filtering by archived', () => {
    // Act.
    cy.get('[data-testid="filterProjects"]')
      .click()
      .contains('archived', { matchCase: false })
      .click();

    cy.get('[data-testid="project"]').its('length').as('projectsCount');
    cy.get('[data-testid="projectArchived"]')
      .its('length')
      .as('archivedProjectsCount');

    // Assert.
    cy.get('@projectsCount').then((projectsCount) =>
      cy.get('@archivedProjectsCount').should('eq', projectsCount)
    );
  });

  it('should show the projects ordered from A to Z', () => {
    // Arrange.
    const mapNames = (el: JQuery<HTMLElement>) => _.map(el, 'textContent');
    cy.get('[data-testid="projectName"]').then(mapNames).as('unorderedNames');

    // Act.
    cy.get('[data-testid="sortProjects"] > div')
      .click()
      .contains('from a to z', { matchCase: false })
      .click();

    // Assert
    cy.get('[data-testid="projectName"]')
      .then(mapNames)
      .then((orderedNames) => {
        cy.get('@unorderedNames').then((unorderedNames) => {
          expect(orderedNames).to.be.deep.equal(_.sortBy(unorderedNames));
        });
      });
  });

  it('should navigate to the user page when click on the user option in the menu', () => {
    // Act.
    cy.get('[data-testid="server"]')
      .click()
      .within(() => {
        cy.get('[data-testid="users"]').click();
      });

    // Assert
    cy.url().should('include', '/users');
    cy.get('[data-testid="usersTable"]').should('exist');
  });
});
