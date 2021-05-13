import { RepositoryType } from '../../src/Graphql/types/globalTypes';
import GetProjectsQuery from '../../src/Mocks/GetProjectsQuery';
import { project1 } from '../../src/Mocks/entities/project';
import { generateSlug } from '../../src/Utils/string';

describe('New Project Behavior', () => {
  const projectName = `my new project`;
  const projectId = generateSlug(projectName);

  beforeEach(() => {
    // Stub response
    cy.kstInterceptor('GetProjects', { data: GetProjectsQuery });
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
      cy.get('[data-testid="goToProjectsListButton"]').click();

      // Assert.
      cy.get('[data-testid="project"]').contains(projectName).should('exist');
    });

    it('should navigate to the overview page of the new project ', () => {
      // Act.
      cy.get('[data-testid="goToProjectButton"]').click();

      // Assert.
      cy.get('[data-testid="overview"]')
        .should('contain', projectName)
        .and('contain', projectId);
      cy.url().should('contain', '/overview');
    });
  });

  describe('Project with error', () => {
    beforeEach(() => {
      createProject(projectName, projectId, { forceNetworkError: true });
    });

    it('should show an error message when the project creation service respond with an error', () => {
      // Assert.
      cy.get('[data-testid="errorMessage"]').should('exist');
    });

    it('should maintain the fields when retry to create a project that fails', () => {
      // Act.
      cy.get('[data-testid="tryAgainButton"]').click();

      // Assert.
      cy.get('[data-testid="informationInputs"]')
        .find('input')
        .eq(0)
        .should('have.value', projectName);
    });
  });
});

const createProject = (name: string, id: string, customResponse?: Object) => {
  // Arrange.

  // Type the name of the project
  cy.get('[data-testid="informationInputs"]').find('input').eq(0).type(name);

  // Type the description of the project
  cy.get('[data-testid="informationInputs"]')
    .find('textarea')
    .type('My super detailed description');

  // Go to the next step
  cy.get('[data-testid="nextButton"]').click();

  // Select the repo type
  cy.get(`[data-testid="${RepositoryType.INTERNAL}"]`).click();

  // Go to the next step
  cy.get('[data-testid="nextButton"]').click();

  // Go to the next step
  cy.get('[data-testid="nextButton"]').click();

  // Stub responses
  const projects = GetProjectsQuery.projects;
  const newProject = { ...project1, id, name };

  // Stub GetProjects
  cy.kstInterceptor('GetProjects', {
    data: { projects: [...projects, newProject] },
  });

  // Stub CreateProject
  cy.kstInterceptor(
    'CreateProject',
    customResponse || { data: { createProject: newProject } }
  );

  cy.wait(1000);

  // Create the project
  cy.get('[data-testid="createProjectButton"]').click();
};
