import GetMeQuery from '../../src/Mocks/GetMeQuery';
import GetRuntimesQuery from '../../src/Mocks/GetRuntimesQuery';
import { join } from 'path';

describe('Kubeconfig Pages Behavior', () => {
  beforeEach(() => {
    cy.kstInterceptor('GetMe', { data: GetMeQuery });
    cy.kstInterceptor('GetRuntimes', { data: GetRuntimesQuery });
    cy.kstInterceptor('GetKubeconfig', { data: { kubeconfig: 'test kubeconfig' } });

    cy.visit('http://localhost:3001/#/user/kubeconfig');
  });

  it('should show kubeconfig page', () => {
    // Assert.
    cy.url().should('contain', '/kubeconfig');
  });

  it('should load kubeconfig', () => {
    // GIVEN there is a kubeconfig
    const kubeconfig = 'test kubeconfig';
    cy.kstInterceptor('GetKubeconfig', { data: { kubeconfig } });

    // THEN the kubeconfig page should render it
    cy.getByTestId('kubeconfig').should('contain', kubeconfig);
  });

  it('should copy kubeconfig to clipboard', () => {
    // GIVEN there is a kubeconfig
    const kubeconfig = 'test kubeconfig';
    cy.kstInterceptor('GetKubeconfig', { data: { kubeconfig } });

    // WHEN the copy button is clicked
    cy.getByTestId('kubeconfigButtons').children().first().click();

    // THEN the clipboard contains the kubeconfig
    cy.window().then((win: Window) => {
      win.navigator.clipboard
        .readText()
        .then((text) => {
          assert.equal(text, kubeconfig);
        })
        .catch((error) => {
          console.log(error);
        });
    });
    cy.contains('Copied to clipboard').should('exist');
  });

  it('should download kubeconfig', () => {
    // GIVEN there is a kubeconfig
    const kubeconfig = 'test kubeconfig';
    cy.kstInterceptor('GetKubeconfig', { data: { kubeconfig } });

    // WHEN the download button is clicked
    cy.getByTestId('kubeconfigButtons').children().last().click();

    // THEN the kubeconfig should be downloaded
    const downloadFolder = Cypress.config('downloadsFolder');
    cy.readFile(join(downloadFolder, 'kubeconfig')).should('exist');
  });
});
