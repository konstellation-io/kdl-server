import GetProjectsQuery from "../../src/Mocks/GetProjectsQuery";
import GetMeQuery from "../../src/Mocks/GetMeQuery";
import GetUsersQuery from "../../src/Mocks/GetUsersQuery";
import GetProjectMembersQuery from "../../src/Mocks/GetMembersQuery";

const { _ } = Cypress;

describe('Home Behavior', () => {
  beforeEach(() => {
    cy.kstInterceptor('GetProjects', { data: GetProjectsQuery });
    cy.kstInterceptor('GetMe', { data: GetMeQuery });
    cy.kstInterceptor('GetUsers', { data: GetUsersQuery });
    cy.kstInterceptor('GetProjectMembers', { data: GetProjectMembersQuery });

    cy.visit('http://localhost:3001/#/projects');
  });

  it('should show projects page', () => {
    // Assert.
    cy.url().should('include', '/projects');
  });

  it('should show at least 2 projects in the page', () => {
    // Act.
    cy.getByTestId('filterProjects')
        .click()
        .contains('active', { matchCase: false })
        .click();
    // Assert.
    cy.getByTestId('project').should('have.length.at.least', 2);
  });

  it('should show 8 projects when filtering by all', () => {
    // Act.
    cy.getByTestId('filterProjects')
      .click()
      .contains('all', { matchCase: false })
      .click();

    // Assert.
    cy.getByTestId('project').should('have.length.at.least', 4);
  });

  it('should show only archived projects when filtering by archived', () => {
    // Act.
    cy.getByTestId('filterProjects')
      .click()
      .contains('archived', { matchCase: false })
      .click();

    cy.getByTestId('project').its('length').as('projectsCount');
    cy.getByTestId('projectArchived').its('length').as('archivedProjectsCount');

    // Assert.
    cy.get('@projectsCount').then((projectsCount) =>
      cy.get('@archivedProjectsCount').should('eq', projectsCount)
    );
  });

  it('should show the projects ordered from A to Z', () => {
    // Arrange.
    const mapNames = (el: JQuery<HTMLElement>) => _.map(el, 'textContent');
    cy.getByTestId('projectName').then(mapNames).as('unorderedNames');

    // Act.
    cy.get('[data-testid="sortProjects"] > div')
      .click()
      .contains('from a to z', { matchCase: false })
      .click();

    // Assert
    cy.getByTestId('projectName')
      .then(mapNames)
      .then((orderedNames) => {
        cy.get('@unorderedNames').then((unorderedNames) => {
          expect(orderedNames).to.be.deep.equal(_.sortBy(unorderedNames));
        });
      });
  });

  it('should navigate to the user page when click on the user option in the menu', () => {
    // Act.
    cy.getByTestId('server').click().findByTestId('users').click();

    // Assert
    cy.url().should('include', '/users');

    cy.getByTestId('usersTable').should('exist');
  });
});
