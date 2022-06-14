import './commands';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to intercept GraphQl queries from the KDL.
       * @example cy.kstInterceptor('GetMe', {name: 'Jon Doe'})
       */
      kstInterceptor(operation: string, responseObject: Object, options?: { delay?: number }): Chainable;

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
}
