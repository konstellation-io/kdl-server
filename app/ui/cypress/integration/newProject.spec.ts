import GetProjectsQuery from '../../src/Mocks/GetProjectsQuery';
import { project1 } from '../../src/Mocks/entities/project';
import { generateSlug } from '../../src/Utils/string';
import GetMeQuery from '../../src/Mocks/GetMeQuery';

describe('New Project Behavior', () => {
  const projectName = 'my new project';
  const projectId = generateSlug(projectName);

  beforeEach(() => {
    // Stub response
    cy.kstInterceptor('GetProjects', { data: GetProjectsQuery });
    cy.kstInterceptor('GetMe', { data: GetMeQuery });
    cy.visit('http://localhost:3001/#/new-project');
  });

  it('should show new project page', () => {
    // Assert.
    cy.url().should('include', '/new-project');
  });

  describe('Project successfully created', () => {
    beforeEach(() => createProject(projectName, projectId));

    it('should show the project in the main page when the project is created', () => {
      // Act.
      cy.getByTestId('goToProjectsListButton').click();

      // Assert.
      cy.getByTestId('project').contains(projectName).should('exist');
    });

    it('should navigate to the overview page of the new project ', () => {
      // Act.
      cy.getByTestId('goToProjectButton').click();

      // Assert.
      cy.getByTestId('overview').should('contain', projectName).and('contain', projectId);
      cy.url().should('contain', '/overview');
    });
  });

  describe('Project with error', () => {
    beforeEach(() => {
      createProject(projectName, projectId, { forceNetworkError: true });
    });

    it('should show an error message when the project creation service respond with an error', () => {
      // Assert.
      cy.getByTestId('errorMessage').should('exist');
    });

    it('should maintain the fields when retry to create a project that fails', () => {
      // Act.
      cy.getByTestId('tryAgainButton').click();

      // Assert.
      cy.getByTestId('informationInputs').find('input').eq(0).should('have.value', projectName);
    });
  });
});

const createProject = (name: string, id: string, customResponse?: Object) => {
  // Arrange.

  // Type the name of the project
  cy.getByTestId('informationInputs').find('input').eq(0).type(name);

  // Type the description of the project
  cy.getByTestId('informationInputs').find('textarea').type('My super detailed description');

  // Go to the next step
  cy.getByTestId('nextButton').click();

  cy.getByTestId('externalRepositoryInputs').find('input').eq(0).type('http://test.com');
  cy.getByTestId('externalRepositoryInputs').find('input').eq(1).type('username-test');
  cy.contains('TOKEN').click();

  cy.getByTestId('externalRepositoryInputs').find('input').eq(2).type('token-test');

  // Go to the next step
  cy.getByTestId('nextButton').click();

  // Stub responses
  const projects = GetProjectsQuery.projects;
  const newProject = { ...project1, id, name };

  // Stub GetProjects
  cy.kstInterceptor('GetProjects', {
    data: { projects: [...projects, newProject] },
  });

  // Stub CreateProject
  cy.kstInterceptor('CreateProject', customResponse || { data: { createProject: newProject } });

  cy.wait(1000);

  // Create the project
  cy.getByTestId('createProjectButton').click();
};
