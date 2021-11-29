import Chainable = Cypress.Chainable;

Cypress.Commands.add('kstInterceptor', (operation, responseObject): Chainable => {
  return cy.intercept('/api/query', (req) => {
    const { operationName } = req.body;
    if (operationName === operation) req.reply(responseObject);
  });
});

Cypress.Commands.add('getByTestId', (dataTestId) => cy.get(`[data-testid="${dataTestId}"]`));

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Cypress.Commands.add('findByTestId', { prevSubject: true }, (subject, dataTestId) =>
  subject.find(`[data-testid="${dataTestId}"]`),
);

Cypress.Commands.add('openSettings', () => {
  cy.visit('http://localhost:3001');
  cy.getByTestId('project').first().parent().click();
  cy.getByTestId('toggleSettings').click();
});

// load type definitions that come with Cypress module
/// <reference types="cypress" />

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to intercept GraphQl queries from the KDL.
     * @example cy.kstInterceptor('GetMe', {name: 'Jon Doe'})
     */
    kstInterceptor(operation: string, responseObject: Object): Chainable;

    /**
     * Custom command to get element by data-testid
     * @example cy.getByTestId('my-data-testid')
     */
    getByTestId(dataTestId: string): Chainable;

    /**
     * Custom command to find an element by data-testid
     * @example cy.findByTestId('my-data-testid')
     */
    findByTestId(dataTestId: string): Chainable;

    /**
     * Custom command to open the settings
     * @example cy.openSettings()
     */
    openSettings(): void;
  }
}
