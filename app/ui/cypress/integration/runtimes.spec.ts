import GetProjectsQuery from '../../src/Mocks/GetProjectsQuery';
import GetMeQuery from '../../src/Mocks/GetMeQuery';
import GetRunningRuntimeQuery from '../../src/Mocks/GetRunningRuntimeQuery';
import GetRuntimesQuery from '../../src/Mocks/GetRuntimesQuery';

describe('Project Navigation Bar Behavior', () => {
  beforeEach(() => {
    // There is a list of projects
    cy.kstInterceptor('GetProjects', { data: GetProjectsQuery });
    // and a user logged
    cy.kstInterceptor('GetMe', { data: GetMeQuery });
    // and a list of available runtimes
    cy.kstInterceptor('GetRuntimes', { data: GetRuntimesQuery });

    cy.visit('http://localhost:3001');
    cy.getByTestId('project').first().parent().click();
  });

  it('should open a warning modal when the user try to stop the tools', () => {
    // GIVEN there is a runtime started
    cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });

    // WHEN the stop runtime button is clicked
    cy.getByTestId('stopTools').click();

    // THEN the stop tools confirmation modal is opened
    cy.getByTestId('stopToolsModal').should('exist');
  });

  it('should open runtimes panels is there is no runtime selected when start tools', () => {
    // GIVEN there is no runtime started
    cy.kstInterceptor('GetRunningRuntime', { data: null });

    // WHEN the start runtime button on the left sidebar is clicked
    cy.getByTestId('startTools').click();

    // THEN the runtime list panel is opened
    cy.getByTestId('runtimesListPanel').should('exist');
  });

  it('should start runtime in runtime info panel', () => {
    // GIVEN there is no runtime started
    cy.kstInterceptor('GetRunningRuntime', { data: null });

    cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: true } });
    cy.getByTestId('openRuntimeSettings').click();
    cy.getByTestId('runtimesList').children().first().click();
    cy.getByTestId('panelStartRuntime').click();

    // THEN the runtime is running
    cy.getByTestId('statusTag').contains('Running');
  });

  it('should stop tools with runtime info stop button', () => {
    // GIVEN there is a runtime started
    cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });

    // WHEN runtime is stopped from runtime info panel
    cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: false } });
    cy.getByTestId('openRuntimeSettings').click();
    cy.getByTestId('runtimesList').children().first().click();
    cy.getByTestId('panelStopRuntime').click();
    cy.contains('Stop Tools').click();

    // THEN the runtime isn't running
    cy.getByTestId('statusTag').should('not.exist');
  });

  it('should redirect to overview page if runtime is stopped and a tool is open', () => {
    // GIVEN there is no runtime started
    cy.kstInterceptor('GetRunningRuntime', { data: null });

    // WHEN a tool is opened
    cy.contains('Vscode').click({ force: true });

    // THEN the navigation is redirected to overview page
    cy.url().should('contain', 'overview');
  });

  it('should allow open user tools if runtime is started', () => {
    // GIVEN there is a runtime started
    cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });

    // WHEN a tool is opened
    cy.contains('Vscode').click();

    // THEN the tools is open
    cy.url().should('contain', 'vscode');
  });

  it('should replace runtime if there is a runtime running but another is started', () => {
    // GIVEN there is no runtime started
    cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });

    cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: true } });
    cy.getByTestId('openRuntimeSettings').click();
    cy.getByTestId('runtimesList').children().last().click();
    cy.getByTestId('panelStartRuntime').click();
    cy.contains('Replace Tools').click();

    // THEN the runtime is running
    cy.getByTestId('statusTag').contains('Running');
  });

  it('should redirect to overview page if try to open tools during replacement of runtimes', () => {
    // GIVEN there is a runtime started
    cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });

    // and the runtime is being replaced with certain delay
    cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: true } }, { delay: 1000 });
    cy.getByTestId('openRuntimeSettings').click();
    cy.getByTestId('runtimesList').children().last().click();
    cy.getByTestId('panelStartRuntime').click();
    cy.contains('Replace Tools').click();

    // WHEN try to open a user tool while request is pending
    cy.contains('Vscode').click({ force: true });

    // THEN should redirect to overview page
    cy.url().should('contain', '/overview');
  });
});
