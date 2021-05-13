describe('Project Navigation Bar Behavior', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001');
    cy.getByTestId('project').first().parent().click();
  });

  it('should show the overview project page', () => {
    // Assert.
    cy.url().should('include', '/projects/').and('include', 'overview');
  });

  it('should show the setting panel when click on settings option', () => {
    // Act.
    cy.getByTestId('toggleSettings').click();

    // Assert.
    cy.getByTestId('settingsPanel').should('exist');
  });

  it('should collapse the bar when click on collapse option', () => {
    // Act.
    cy.getByTestId('toggleBar').click();

    // Assert.
    cy.getByTestId('navigationBar').should('satisfy', ($el) => {
      const classList: string[] = Array.from($el[0].classList);
      return classList.every((c) => !c.includes('opened'));
    });
  });

  it('should open the bar when click on collapse option and the bar is already collapsed', () => {
    // Arrange.
    cy.getByTestId('toggleBar').click();
    cy.wait(800);

    // Act.
    cy.getByTestId('toggleBar').click();

    // Assert.
    cy.getByTestId('navigationBar').should('satisfy', ($el) => {
      const classList: string[] = Array.from($el[0].classList);
      return classList.some((c) => c.includes('opened'));
    });
  });

  it('should open a warning modal when the user try to stop the tools', () => {
    // Act.
    cy.getByTestId('stopTools').click();

    // Assert.
    cy.getByTestId('confirmationModal').find('.modal').should('exist');
  });

  it('should open the knowledge viewer panel when click on the knowledge viewer button', () => {
    // Act.
    cy.getByTestId('toggleKnowledgeViewer').click();

    // Assert.
    cy.getByTestId('knowledgeViewerList').should('exist');
  });

  it('should close the knowledge viewer panel when click on the knowledge viewer button and it is already open', () => {
    // Arrange.
    cy.getByTestId('toggleKnowledgeViewer').click();
    cy.wait(800);

    // Act.
    cy.getByTestId('toggleKnowledgeViewer').click();

    // Assert.
    cy.getByTestId('knowledgeViewerList').should('not.exist');
  });
});
