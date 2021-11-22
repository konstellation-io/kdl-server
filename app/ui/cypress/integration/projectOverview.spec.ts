import GetProjectsQuery from "../../src/Mocks/GetProjectsQuery";
import GetMeQuery from "../../src/Mocks/GetMeQuery";
import GetUsersQuery from "../../src/Mocks/GetUsersQuery";
import GetProjectMembers from "../../src/Mocks/GetProjectMembers";

describe('Project Overview Behavior', () => {
  beforeEach(() => {
    cy.kstInterceptor('GetMe', {data: GetMeQuery});
    cy.kstInterceptor('GetUsers', {data: GetUsersQuery});
    cy.kstInterceptor('GetProjects', {data: GetProjectsQuery});
    cy.kstInterceptor('GetProjectMembers', {data: GetProjectMembers});

    cy.visit('http://localhost:3001/#/projects');
    // Arrange.
    cy.getByTestId('projectName').first().invoke('text').as('projectName');

    // Act.
    cy.getByTestId('project').first().parent().click();
  });

  it('should show the name of the project in the overview page', () => {
    // Assert.
    cy.get('@projectName').then((projectName) =>
      cy.getByTestId('overview').should('contain', projectName)
    );
  });

  it('should show the settings panel with the git tab selected when click on repository container', () => {
    // Act.
    cy.getByTestId('repositorySection').click();

    // Assert.
    cy.getByTestId('tabGit').should('exist');
  });

  it('should show the settings panel with the members tab selected when click on members container', () => {
    // Act.
    cy.getByTestId('membersSection').click();

    // Assert.
    cy.getByTestId('tabMembers').should('exist');
  });
});
