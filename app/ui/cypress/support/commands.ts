import Chainable = Cypress.Chainable;

Cypress.Commands.add('kstInterceptor', (operation, responseObject, options): Chainable => {
  return cy.intercept('/api/query', (req) => {
    const { operationName } = req.body;
    if (operationName === operation)
      req.reply({ body: responseObject, ...(options?.delay ? { delay: options.delay } : {}) });
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
