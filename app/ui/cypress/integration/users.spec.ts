describe('Users Page', () => {
  beforeEach(() => {
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
    cy.get('[data-testid="userRoleSelect"]')
      .first()
      .click()
      .contains(newRole)
      .click();

    // Assert.
    cy.get('[data-testid="userRoleSelect"]')
      .first()
      .invoke('text')
      .should('equal', newRole);
  });

  describe('bulk actions', () => {
    const usersToChange = 3;
    const newBulkRole = 'Viewer';

    beforeEach(() => {
      // Arrange.

      // Check first n (where n = 3) users
      cy.get('[data-testid="usersTable"]')
        .find('tbody')
        .find('[data-testid="checkUser"]')
        .each((checkEl, index) => {
          if (index < usersToChange) cy.wrap(checkEl).click();
        });

      // Select new role for these three users
      cy.get('[data-testid="bulkSelect"]')
        .click()
        .contains(newBulkRole)
        .click();

      // Yield first three users role select
      cy.get('[data-testid="userRoleSelect"]')
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
