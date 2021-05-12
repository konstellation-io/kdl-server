describe('Project Navigation Bar Behavior', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001');
    cy.get('[data-testid="project"]').first().parent().click();
  });

  it('should show the overview project page', () => {
    // Assert.
    cy.url().should('include', '/projects/').and('include', 'overview');
  });

  it('should show the setting panel when click on settings option', () => {
    // Act.
    cy.get('[data-testid="toggleSettings"]').click();

    // Assert.
    cy.get('[data-testid="settingsPanel"]').should('exist');
  });

  it('should collapse the bar when click on collapse option', () => {
    // Act.
    cy.get('[data-testid="toggleBar"]').click();

    // Assert.
    cy.get('[data-testid="navigationBar"]').should('satisfy', ($el) => {
      const classList: string[] = Array.from($el[0].classList);
      return classList.every((c) => !c.includes('opened'));
    });
  });

  it('should open the bar when click on collapse option and the bar is already collapsed', () => {
    // Arrange.
    cy.get('[data-testid="toggleBar"]').click();
    cy.wait(800);

    // Act.
    cy.get('[data-testid="toggleBar"]').click();

    // Assert.
    cy.get('[data-testid="navigationBar"]').should('satisfy', ($el) => {
      const classList: string[] = Array.from($el[0].classList);
      return classList.some((c) => c.includes('opened'));
    });
  });

  it('should open a warning modal when the user try to stop the tools', () => {
    // Act.
    cy.get('[data-testid="stopTools"]').click();

    // Assert.
    cy.get('[data-testid="confirmationModal"]').find('.modal').should('exist');
  });

  it('should open the knowledge viewer panel when click on the knowledge viewer button', () => {
    // Act.
    cy.get('[data-testid="toggleKnowledgeViewer"]').click();

    // Assert.
    cy.get('[data-testid="knowledgeViewerList"]').should('exist');
  });

  it('should close the knowledge viewer panel when click on the knowledge viewer button and it is already open', () => {
    // Arrange.
    cy.get('[data-testid="toggleKnowledgeViewer"]').click();
    cy.wait(800);

    // Act.
    cy.get('[data-testid="toggleKnowledgeViewer"]').click();

    // Assert.
    cy.get('[data-testid="knowledgeViewerList"]').should('not.exist');
  });
});
