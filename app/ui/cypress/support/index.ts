Cypress.Commands.add('kstInterceptor', (operation, responseObject) => {
  cy.intercept('/api/query', (req) => {
    const { operationName } = req.body;
    if (operationName === operation) req.reply(responseObject);
  });
});

// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to intercept GraphQl queries from the KDL.
     * @example cy.kstInterceptor('GetMe', {name: marco, second})
     */
    kstInterceptor(
      operation: string,
      responseObject: Object
    ): Chainable<Element>;
  }
}
