import { project1 } from '../../src/Mocks/entities/project';
import GetMeQuery from '../../src/Mocks/GetMeQuery';
import GetUsersQuery from '../../src/Mocks/GetUsersQuery';
import GetProjectsQuery from '../../src/Mocks/GetProjectsQuery';

describe('Settings Info Behavior', () => {
  beforeEach(() => {
    cy.kstInterceptor('GetMe', { data: GetMeQuery });
    cy.kstInterceptor('GetUsers', { data: GetUsersQuery });
    cy.kstInterceptor('GetProjects', { data: GetProjectsQuery });
    cy.kstInterceptor('GetProjectMembers', {
      data: GetProjectsQuery.projects[0],
    });
    cy.openSettings();
  });

  it('should show the new name of the project in the overview page', () => {
    // Arrange.
    const newProjectName = 'my super project';

    // Stub update project
    cy.kstInterceptor('UpdateProject', {
      data: { updateProject: { ...project1, name: newProjectName } },
    });

    // Act.
    cy.getByTestId('tabInfo').find('input').eq(0).clear().type(newProjectName).blur();

    // Assert.
    cy.getByTestId('overview').should('contain', newProjectName);
    cy.get('[role="toastMessage"]').should('exist');
  });

  it('should show the secondary panel when click on the edit abstract', () => {
    // Act.
    cy.getByTestId('editAbstract').click();

    // Assert.
    cy.getByTestId('updateDescription').should('exist').contains('Save').should('have.css', 'pointer-events', 'none');
  });

  it('should show the new description in the overview page when edit the description', () => {
    // Arrange.
    const newDescription = 'my fancy description';

    // Stub update project
    cy.kstInterceptor('UpdateProject', {
      data: { updateProject: { ...project1, description: newDescription } },
    });

    // Click on the edit button
    cy.getByTestId('editAbstract').click();

    // Type new description
    cy.getByTestId('updateDescription').find('textarea').clear().type(newDescription);

    // Act.
    cy.getByTestId('updateDescription').contains('Save').click();

    // Assert.
    cy.getByTestId('overview').should('contain', newDescription);
  });
});
