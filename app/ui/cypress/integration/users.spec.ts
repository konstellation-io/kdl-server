import GetMeQuery from "../../src/Mocks/GetMeQuery";
import GetProjectsQuery from "../../src/Mocks/GetProjectsQuery";
import GetProjectMembers from "../../src/Mocks/GetProjectMembers";
import {user1, user2} from "../../src/Mocks/entities/user";
import UpdateAccessLevelMutation from "../../src/Mocks/UpdateAccessLevelMutation";

describe('Users Behavior', () => {
  beforeEach(() => {
    cy.kstInterceptor('GetMe', {data: GetMeQuery});
    cy.kstInterceptor('GetUsers', {data: { users: [user1, user2]}});
    cy.kstInterceptor('GetProjects', {data: GetProjectsQuery});
    cy.kstInterceptor('GetProjectMembers', {data: GetProjectMembers});
    cy.kstInterceptor('UpdateAccessLevel', { data: UpdateAccessLevelMutation });

    cy.visit('http://localhost:3001/#/users');
  });

  it('should show users page', () => {
    // Assert.
    cy.url().should('include', '/users');
  });

  it('should reflect the new role in the table when change role of a single user', () => {
    // Arrange.
    const newRole = 'Viewer';

    // Act.
    cy.getByTestId('userRoleSelect').first().click().contains(newRole).click();

    // Assert.
    cy.getByTestId('userRoleSelect')
      .first()
      .invoke('text')
      .should('equal', newRole);
  });

  describe('bulk actions', () => {
    const usersToChange = 2;
    const newBulkRole = 'Viewer';

    beforeEach(() => {
      // Arrange.

      // Check first n (where n = 3) users
      cy.getByTestId('usersTable')
        .find('tbody')
        .findByTestId('checkUser')
        .each((checkEl, index) => {
          if (index < usersToChange) cy.wrap(checkEl).click();
        });

      // Select new role for these three users
      cy.getByTestId('bulkSelect').click().contains(newBulkRole).click();

      // Yield first three users role select
      cy.getByTestId('userRoleSelect')
        .then((selectElements) => selectElements.slice(0, usersToChange))
        .as('users');

      cy.get('.modal').as('usersModal');
    });

    it('should show modal when you try to change multiple users role at once', () => {
      // Assert.
      cy.get('@usersModal').should('exist');
    });

    it('should close the modal when you click on cancel button', () => {
      // Act.
      cy.get('@usersModal').contains('Cancel').click();

      // Assert.
      cy.get('@usersModal').should('not.exist');
    });

    it('should reflect the new role in the table when change the role of multiple users', () => {
      // Act.
      cy.get('@usersModal').contains(`Update ${usersToChange} users`).click();

      // Assert.
      cy.get('@users').each((userRole) => {
        cy.wrap(userRole).invoke('text').should('equal', newBulkRole);
      });
    });
  });
});
