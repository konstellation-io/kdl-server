import GetProjectsQuery from '../../src/Mocks/GetProjectsQuery';
import GetMeQuery from '../../src/Mocks/GetMeQuery';
import GetRunningRuntimeQuery from '../../src/Mocks/GetRunningRuntimeQuery';
import GetRunningCapabilitiesQuery from '../../src/Mocks/GetRunningCapabilitiesQuery';
import GetRuntimesQuery from '../../src/Mocks/GetRuntimesQuery';
import GetCapabilitiesQuery from '../../src/Mocks/GetCapabilitiesQuery';
import { runtime2 } from '../../src/Mocks/entities/runtime';

const isRuntimeRunning = (runtimeName: string) => {
  cy.getByTestId('openRuntimeSettings').click();
  cy.getByTestId('runtimesList').contains(runtimeName).click();

  cy.getByTestId('runtimeInfoPanel').should('contain', runtimeName);
  cy.getByTestId('statusTag').should('contain', 'Running');
};

const isRuntimeStopped = (runtimeName: string) => {
  cy.getByTestId('openRuntimeSettings').click();
  cy.getByTestId('runtimesList').contains(runtimeName).click();

  cy.getByTestId('runtimeInfoPanel').should('contain', runtimeName);
  cy.getByTestId('statusTag').should('not.exist');
};

describe('Runtimes Behaviour', () => {
  beforeEach(() => {
    // There is a list of projects
    cy.kstInterceptor('GetProjects', { data: GetProjectsQuery });
    // and a user logged
    cy.kstInterceptor('GetMe', { data: GetMeQuery });
    // and a list of available runtimes
    cy.kstInterceptor('GetRuntimes', { data: GetRuntimesQuery });
    // and a list of available capabilities
    cy.kstInterceptor('GetCapabilities', { data: GetCapabilitiesQuery });
    // and a default running capability
    cy.kstInterceptor('GetRunningCapabilities', { data: GetRunningCapabilitiesQuery });
  });

  describe('Left Sidebar Buttons Behaviour', () => {
    it('should open runtimes panels if there is no runtime selected when start tools', () => {
      // GIVEN there is no runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: null });

      // WHEN the start runtime button on the left sidebar is clicked
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and the runtime us started
      cy.getByTestId('startTools').click();

      // THEN the runtime list panel is opened
      cy.getByTestId('runtimesListPanel').should('exist');
    });

    it('should stop the runtime is the stop button is clicked and the action is confirmed', () => {
      // GIVEN there is a runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });
      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: false } });

      // WHEN the stop runtime button is clicked
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and the runtime is stopped
      cy.getByTestId('stopTools').click();

      // and the action is confirmed
      cy.contains('Stop Tools').click();

      // THEN the runtime is stopped
      isRuntimeStopped(GetRunningRuntimeQuery.runningRuntime.name);
    });

    it('should start last running runtime if its previously stopped', () => {
      // GIVEN there is a runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });
      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: true } });

      // WHEN the start runtime button is clicked
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and the runtime is stopped
      cy.getByTestId('stopTools').click();
      cy.contains('Stop Tools').click();

      // and the runtime is started
      cy.getByTestId('startTools').click();

      // THEN the last runtime in execution is started
      isRuntimeRunning(GetRunningRuntimeQuery.runningRuntime.name);
    });
  });

  describe('Runtime Info Panel Behaviour', () => {
    it('should start runtime in runtime info panel', () => {
      // GIVEN there is no runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: null });

      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: true } });

      // WHEN visiting the project
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and the runtimes panels is opened
      cy.getByTestId('openRuntimeSettings').click();
      cy.getByTestId('runtimesList').children().first().click();
      cy.getByTestId('panelStartRuntime').click();

      // THEN the runtime is running
      cy.getByTestId('statusTag').contains('Running');
    });

    it('should stop tools with runtime info stop button', () => {
      // GIVEN there is a runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });
      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: false } });

      // WHEN the project page is visited
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and the runtimes panel is opened
      cy.getByTestId('openRuntimeSettings').click();
      cy.getByTestId('runtimesList').children().first().click();

      // and the runtime is stopped
      cy.getByTestId('panelStopRuntime').click();
      cy.contains('Stop Tools').click();

      // THEN the runtime isn't running
      cy.getByTestId('statusTag').should('not.exist');
    });

    it('should replace runtime if there is a runtime running but another is started', () => {
      // GIVEN there is no runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });
      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: true } });

      // WHEN the project page is visited
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and the runtimes panel is opened
      cy.getByTestId('openRuntimeSettings').click();
      cy.getByTestId('runtimesList').children().last().click();
      cy.getByTestId('panelStartRuntime').click();

      // and the replace tools panel is opened
      cy.contains('Replace Tools').click();

      // THEN the runtime is running
      cy.getByTestId('statusTag').contains('Running');
    });
  });

  describe('User Tools Navigation Behaviour', () => {
    it('should redirect to overview page if runtime is stopped and a tool is open', () => {
      // GIVEN there is no runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: null });

      // WHEN the project page is visited
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and a tool is opened
      cy.contains('Vscode').click({ force: true });

      // THEN the navigation is redirected to overview page
      cy.url().should('contain', 'overview');
    });

    it('should allow open user tools if runtime is started', () => {
      // GIVEN there is a runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });

      // WHEN the project page is visited
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and a tool is opened
      cy.contains('Vscode').click();

      // THEN the tools is open
      cy.url().should('contain', 'vscode');
    });

    it('should redirect to overview page if try to open tools during replacement of runtimes', () => {
      // GIVEN there is a runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });

      // and the runtime is being replaced with certain delay
      cy.kstInterceptor('SetActiveUserTools', { data: { id: true } }, { delay: 1000 });

      // WHEN the project page is visited
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and the runtimes panel is opened
      cy.getByTestId('openRuntimeSettings').click();
      cy.getByTestId('runtimesList').children().last().click();
      cy.getByTestId('panelStartRuntime').click();

      // and the replace runtime panel is opened
      cy.contains('Replace Tools').click();

      // WHEN try to open a user tool while request is pending
      cy.contains('Vscode').click({ force: true });

      // THEN should redirect to overview page
      cy.url().should('contain', '/overview');
    });

    it('should show the badged loading or running', () => {
      // GIVEN there is a runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: { runningRuntime: null } });

      // and the first runtime selected
      cy.kstInterceptor('SetActiveUserTools', { data: { id: GetRuntimesQuery.runtimes[0].id } }, { delay: 1000 });

      // When the project page is visited
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      //and we start it
      cy.getByTestId('openRuntimeSettings').click();
      cy.getByTestId('runtimesList').children().first().click();
      cy.getByTestId('panelStartRuntime').click();

      // THEN should show loading badge
      cy.getByTestId('statusTag').contains('Loading');
    });
  });

  describe('Runtimes Crumb Behaviour', () => {
    it('should replace runtime from crumb list' + '', () => {
      // GIVEN there is a runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });
      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: true } });
      // and another runtime to run
      const runtimeName = runtime2.name;

      // WHEN the project page is visited
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and we click the runtime we want to run on the runtimes crumb
      cy.getByTestId('runtimesCrumb').click();
      cy.contains(runtimeName).click();

      // and the action is confirmed
      cy.contains('Replace Tools').click();

      // THEN the runtime is replaced
      isRuntimeRunning(runtimeName);
    });

    it('should allow start any runtime if there is one stopped', () => {
      // GIVEN there is a runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });
      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: true } });
      // and another runtime to run
      const runtimeName = runtime2.name;

      // WHEN the project page is visited
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and we stop the actual runtime
      cy.getByTestId('stopTools').click();
      cy.contains('Stop Tools').click();

      // WHEN we click the runtime we want to run on the runtimes crumb
      cy.getByTestId('runtimesCrumb').click();
      cy.contains(runtimeName).click();

      // THEN the runtime is started
      isRuntimeRunning(runtimeName);
    });
  });
  describe('Runtimes Info-Panel Behaviour', () => {
    it('There should be only safe tags on runtime description', () => {
      // GIVEN there is a runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });
      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: false } });

      // WHEN the project page is visited
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and runtime info panel is opened
      cy.getByTestId('openRuntimeSettings').click();
      cy.getByTestId('runtimesList').children().first().click();

      // THEN the description should only contain safe tags
      cy.getByTestId('runtimeDescriptionField').should('not.contain', '<script>');
      cy.getByTestId('runtimeDescriptionField').get('ul').should('exist');
    });
  });
});
