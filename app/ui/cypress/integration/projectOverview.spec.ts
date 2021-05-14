describe('Project Overview Behavior', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001');
  });

  it('should show the name of the project in the overview page', () => {
    // Arrange.
    cy.getByTestId('projectName').first().invoke('text').as('projectName');

    // Act.
    cy.getByTestId('project').first().parent().click();

    // Assert.
    cy.get('@projectName').then((projectName) =>
      cy.getByTestId('overview').should('contain', projectName)
    );
  });

  it('should show the settings panel with the git tab selected when click on repository container', () => {
    // Arrange.
    cy.getByTestId('project').first().parent().click();

    // Act.
    cy.getByTestId('repositorySection').click();

    // Assert.
    cy.getByTestId('tabGit').should('exist');
  });

  it('should show the settings panel with the members tab selected when click on members container', () => {
    // Arrange.
    cy.getByTestId('project').first().parent().click();

    // Act.
    cy.getByTestId('membersSection').click();

    // Assert.
    cy.getByTestId('tabMembers').should('exist');
  });
});
