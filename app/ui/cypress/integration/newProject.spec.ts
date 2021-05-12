import { RepositoryType } from '../../src/Graphql/types/globalTypes';
import GetProjectsQuery from '../../src/Mocks/GetProjectsQuery';
import { project1 } from '../../src/Mocks/entities/project';
import { generateSlug } from '../../src/Utils/string';

const PROJECT_WITH_ERROR = 'project with error';

describe('New Project Page', () => {
  beforeEach(() => {
    // Stub response
    cy.intercept('/api/query', (req) => {
      const { operationName } = req.body;
      if (operationName === 'GetProjects')
        req.reply({ data: GetProjectsQuery });
    });
    cy.visit('http://localhost:3001/#/new-project');
  });

  it('should show new project page', () => {
    // Assert.
    cy.url().should('include', '/new-project');
  });

  describe('Project successfully created', () => {
    const projectName = `my new project`;
    const projectId = generateSlug(projectName);

    it('should show the project in the main page when the project is created', () => {
      // Arrange.
      createProject(projectName, projectId);

      // Act.
      cy.get('[data-testid="goToProjectsListButton"]').click();

      // Assert.
      cy.get('[data-testid="project"]').contains(projectName).should('exist');
    });

    it('should navigate to the overview page of the new project ', () => {
      // Arrange.
      createProject(projectName, projectId);

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
    const projectId = generateSlug(PROJECT_WITH_ERROR);

    it('should show an error message when the project creation service respond with an error', () => {
      // Act.
      createProject(PROJECT_WITH_ERROR, projectId);

      // Assert.
      cy.get('[data-testid="errorMessage"]').should('exist');
    });

    it('should maintain the fields when retry to create a project that fails', () => {
      // Arrange.
      createProject(PROJECT_WITH_ERROR, projectId);

      // Act.
      cy.get('[data-testid="tryAgainButton"]').click();

      // Assert.
      cy.get('[data-testid="informationInputs"]')
        .find('input')
        .eq(0)
        .should('have.value', PROJECT_WITH_ERROR);
    });
  });
});

const createProject = (name: string, id: string) => {
  // Arrange.

  // Type the name of the project
  cy.get('[data-testid="informationInputs"]').find('input').eq(0).type(name);

  // Type the id of the project
  cy.get('[data-testid="informationInputs"]')
    .find('input')
    .eq(1)
    .clear()
    .type(id);

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
  cy.intercept('/api/query', (req) => {
    const { operationName, variables } = req.body;
    const projects = GetProjectsQuery.projects;
    const newProject = { ...project1, id, name };

    if (operationName === 'GetProjects') {
      req.reply({ data: { projects: [...projects, newProject] } });
    }

    if (operationName === 'CreateProject') {
      if (variables.input.name === PROJECT_WITH_ERROR) {
        req.reply({ forceNetworkError: true });
      } else {
        req.reply({
          data: { createProject: newProject },
        });
      }
    }
  });

  cy.wait(1000);

  // Create the project
  cy.get('[data-testid="createProjectButton"]').click();
};
