describe('Users Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001/#/users');
  });

  it('should show users page', () => {
    // Assert.
    cy.url().should('include', '/users');
  });

  it('should reflect the new role in the table when change role of a single user', () => {
    // Act.
    cy.get('[data-testid="userRoleSelect"]')
      .first()
      .click()
      .find('div > div > div > div')
      .last()
      .click()
      .invoke('text')
      .as('newRole');

    // Assert.
    cy.get('@newRole').then((newRole) => {
      cy.get('[data-testid="userRoleSelect"]')
        .first()
        .invoke('text')
        .should('equal', newRole);
    });
  });

  describe('bulk actions', () => {
    beforeEach(() => {
      // Arrange.
      const usersToChange = 3;

      cy.get('[data-testid="usersTable"]')
        .find('tbody')
        .find('[data-testid="checkUser"]')
        .each((checkEl, index) => {
          if (index < usersToChange) {
            cy.wrap(checkEl).click();
          }
        });
    });

    it('should reflect the new role in the table when change the role of multiple users', () => {
      // Act.
    });
  });
});
