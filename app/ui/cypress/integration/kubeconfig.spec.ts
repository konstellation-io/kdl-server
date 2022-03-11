import GetMeQuery from '../../src/Mocks/GetMeQuery';
import GetRuntimesQuery from '../../src/Mocks/GetRuntimesQuery';
import { join } from 'path';
import GetProjectsQuery from '../../src/Mocks/GetProjectsQuery';
import GetRunningRuntimeQuery from '../../src/Mocks/GetRunningRuntimeQuery';

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

  it('should redirect to projects if kubeconfig isnt enabled', () => {
    cy.kstInterceptor('GetMe', { data: { me: { ...GetMeQuery.me, isKubeconfigEnabled: false } } });
    cy.visit('http://localhost:3001/#/user/kubeconfig');

    // Assert.
    cy.url().should('contain', '/projects');
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
    // and the browser has permissions to use the clipboard (requested in headless execution)
    cy.wrap(
      Cypress.automation('remote:debugger:protocol', {
        command: 'Browser.grantPermissions',
        params: {
          permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
          origin: window.location.origin,
        },
      }),
    );

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

  it('should go back when click on back arrow', () => {
    // GIVEN there is a list of projects
    cy.kstInterceptor('GetProjects', { data: GetProjectsQuery });
    // and a runtime is running
    cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });
    // and we navigate to kubeconfig from the settings crumb
    cy.visit('http://localhost:3001');
    cy.getByTestId('project').first().parent().click();
    cy.getByTestId('settingsCrumb').click();
    cy.contains('Kubeconfig').click();

    // WHEN the arrow button in the left of the title is clicked
    cy.getByTestId('userPageHeader').children().first().click();

    // THEN it should navigate to the previous page
    cy.url().should('contain', '/overview');
  });
});
