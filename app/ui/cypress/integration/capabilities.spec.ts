import GetProjectsQuery from '../../src/Mocks/GetProjectsQuery';
import GetMeQuery from '../../src/Mocks/GetMeQuery';
import GetRuntimesQuery from '../../src/Mocks/GetRuntimesQuery';
import GetCapabilitiesQuery from '../../src/Mocks/GetCapabilitiesQuery';
import GetSingleCapabilityQuery from '../../src/Mocks/GetSingleCapabilityQuery';
import GetRunningCapabilitiesQuery from '../../src/Mocks/GetRunningCapabilitiesQuery';
import GetRunningCapabilities2Query from '../../src/Mocks/GetRunningCapabilities2Query';
import GetRunningRuntimeQuery from '../../src/Mocks/GetRunningRuntimeQuery';
import { capability, capability2 } from '../../src/Mocks/entities/capabilities';

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

describe('Capabilities Behaviour', () => {
  beforeEach(() => {
    // There is a list of projects
    cy.kstInterceptor('GetProjects', { data: GetProjectsQuery });
    // and a user logged
    cy.kstInterceptor('GetMe', { data: GetMeQuery });
    // and a list of available runtimes
    cy.kstInterceptor('GetRuntimes', { data: GetRuntimesQuery });
  });

  describe('Top bar selector behaviour', () => {
    it('should not exist when there is no capabilities available', () => {
      // GIVEN there is no capabilities
      cy.kstInterceptor('GetCapabilities', { data: null });
      // and there is not running capability
      cy.kstInterceptor('GetRunningCapabilities', { data: null });

      // WHEN the start runtime button on the left sidebar is clicked
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and open the details page
      cy.getByTestId('openRuntimeSettings').click();
      cy.getByTestId('runtimesList').children().last().click();

      // THEN check the default capability is selected
      cy.getByTestId('capabilitiesTag').should('not.exist')
      cy.getByTestId('capabilitiesCrumb').should('not.exist');
    });

    it('should not show when there is one capability available, and the capability should be selected by default', () => {
      // GIVEN there is no capabilities
      cy.kstInterceptor('GetCapabilities', { data: GetSingleCapabilityQuery });
      // and there is not running capability
      cy.kstInterceptor('GetRunningCapabilities', { data: null });

      // WHEN the start runtime button on the left sidebar is clicked
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and open the details page
      cy.getByTestId('openRuntimeSettings').click();
      cy.getByTestId('runtimesList').children().last().click();

      // THEN check the default capability is selected
      cy.getByTestId('capabilitiesTag').contains(capability.name)
      cy.getByTestId('capabilitiesCrumb').should('be.hidden');
    });

    it('should select the default capability when a project is opened', () => {
      // GIVEN there is not running capabilites
      cy.kstInterceptor('GetRunningCapabilities', { data: null });
      // and a list of available capabilities
      cy.kstInterceptor('GetCapabilities', { data: GetCapabilitiesQuery });

      // WHEN the start runtime button on the left sidebar is clicked
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // THEN check the default capability is selected
      cy.getByTestId('capabilitiesCrumb').contains(capability2.name);
    });

    it('should select the running capability as the selected capability when a project is opened', () => {
      // GIVEN there is not running capabilites
      cy.kstInterceptor('GetRunningCapabilities', { data: GetRunningCapabilities2Query });
      // and a list of available capabilities
      cy.kstInterceptor('GetCapabilities', { data: GetCapabilitiesQuery });

      // WHEN the start runtime button on the left sidebar is clicked
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // THEN check the default capability is selected
      cy.getByTestId('capabilitiesCrumb').contains(capability2.name);
    });

    it('should replace the selected capability when there is no runtime selected', () => {
      // GIVEN there is a default running capabilites
      cy.kstInterceptor('GetRunningCapabilities', { data: GetRunningCapabilitiesQuery });
      //and a list of available capabilities
      cy.kstInterceptor('GetCapabilities', { data: GetCapabilitiesQuery });
      // and there is not running runtime
      cy.kstInterceptor('GetRunningRuntime', { data: null });
      // and user tools are not active
      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: false } });

      // WHEN the start runtime button on the left sidebar is clicked
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and waits for the selected capability to be called
      cy.getByTestId('capabilitiesCrumb').contains(capability.name);

      // and select a different capability to open the replace tools modal
      cy.getByTestId('capabilitiesCrumb').click();
      cy.contains(capability2.name).click();

      // and the action is confirmed
      cy.contains('Replace Capabilities').click();

      // THEN check the default capability is selected
      cy.getByTestId('capabilitiesCrumb').contains(capability2.name);
    });

    it('should replace the selected capability when there is a runtime selected', () => {
      // GIVEN a list of available capabilities
      cy.kstInterceptor('GetCapabilities', { data: GetCapabilitiesQuery });
      // and there is a default running capabilites
      cy.kstInterceptor('GetRunningCapabilities', { data: GetRunningCapabilitiesQuery });
      // and there is not running runtime
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });
      // and user tools are not active
      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: false } });

      // WHEN the start runtime button on the left sidebar is clicked
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and waits for the selected capability to be called
      cy.getByTestId('capabilitiesCrumb').contains(capability.name);

      // and select a different capability to open the replace tools modal
      cy.getByTestId('capabilitiesCrumb').click();
      cy.contains(capability2.name).click();

      // and the action is confirmed
      cy.contains('Replace Capabilities').click();

      // THEN check the default capability is selected
      cy.getByTestId('capabilitiesCrumb').contains(capability2.name);
    });
  });

  describe('Left Sidebar Buttons Behaviour', () => {
    it('should start runtime with the default capability between the existing ones', () => {
      // GIVEN there is a runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });
      // and the user tools are not started
      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: true } });
      //and there is a default capability selected
      cy.kstInterceptor('GetCapabilities', { data: GetCapabilitiesQuery });
      // and there is not running capability
      cy.kstInterceptor('GetRunningCapabilities', { data: null });

      // WHEN the start runtime button on the left sidebar is clicked
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and the runtime is stopped
      cy.getByTestId('stopTools').click();
      cy.contains('Stop Tools').click();

      // and the runtime us started
      cy.getByTestId('startTools').click();

      // and the runtimes panels is opened
      cy.getByTestId('openRuntimeSettings').click();
      cy.getByTestId('runtimesList').children().first().click();

      // THEN the runtime is running
      cy.getByTestId('statusTag').contains('Running');
      cy.getByTestId('capabilitiesTag').contains(capability2.name);
    });

    it('should start runtime with the only existing capability', () => {
      // GIVEN there is a runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });
      // and the user tools are not started
      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: true } });
      //and there is a default capability selected
      cy.kstInterceptor('GetCapabilities', { data: GetSingleCapabilityQuery });
      // and there is not running capability
      cy.kstInterceptor('GetRunningCapabilities', { data: null });

      // WHEN the start runtime button on the left sidebar is clicked
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and the runtime is stopped
      cy.getByTestId('stopTools').click();
      cy.contains('Stop Tools').click();

      // and the runtime us started
      cy.getByTestId('startTools').click();

      // and the runtimes panels is opened
      cy.getByTestId('openRuntimeSettings').click();
      cy.getByTestId('runtimesList').children().first().click();

      // THEN the runtime is running
      cy.getByTestId('capabilitiesCrumb').should('be.hidden');
      cy.getByTestId('statusTag').contains('Running');
      cy.getByTestId('capabilitiesTag').contains(capability.name);
    });

    it('should show error message on capability not selected', () => {
      // GIVEN there is a runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });
      // and the user tools are not started
      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: true } });
      //and there is no capabilities to be selected
      cy.kstInterceptor('GetCapabilities', { data: null });
      // and there is not running capability
      cy.kstInterceptor('GetRunningCapabilities', { data: null });

      // WHEN the start runtime button on the left sidebar is clicked
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and the runtime is stopped
      cy.getByTestId('stopTools').click();
      cy.contains('Stop Tools').click();

      // and the runtime us started
      cy.getByTestId('startTools').click();

      // THEN the runtime is running
      // THEN the runtime is running
      cy.getByTestId('capabilitiesCrumb').should('not.exist');
      cy.getByTestId('runtimeInfoPanel').should('not.exist');
      cy.contains('CANNOT START TOOLS').should('exist');
    });
  });

  describe('Runtime Information Panel Behaviour', () => {
    it('should not open the runtime information panel if there is no capabilities to be selected', () => {
      // GIVEN there is a runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });
      // and the user tools are not started
      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: true } });
      //and there is a default capability selected
      cy.kstInterceptor('GetCapabilities', { data: null });
      // and there is not running capability
      cy.kstInterceptor('GetRunningCapabilities', { data: null });

      // WHEN the start runtime button on the left sidebar is clicked
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and the runtime is stopped
      cy.getByTestId('stopTools').click();
      cy.contains('Stop Tools').click();

      // and the runtimes panels is opened
      cy.getByTestId('openRuntimeSettings').click();
      cy.getByTestId('runtimesList').children().first().click();

      // THEN the runtime is running
      cy.getByTestId('runtimeInfoPanel').should('not.exist');
    });

    it('should change the selected capability tag when the panel is opened and the capabilities are changed', () => {
      // GIVEN there is a runtime started
      cy.kstInterceptor('GetRunningRuntime', { data: GetRunningRuntimeQuery });
      // and the user tools are not started
      cy.kstInterceptor('SetActiveUserTools', { data: { areToolsActive: true } });
      //and there is a default capability selected
      cy.kstInterceptor('GetCapabilities', { data: GetCapabilitiesQuery });
      // and there is not running capability
      cy.kstInterceptor('GetRunningCapabilities', { data: GetRunningCapabilitiesQuery });

      // WHEN the start runtime button on the left sidebar is clicked
      cy.visit('http://localhost:3001');
      cy.getByTestId('project').first().parent().click();

      // and the runtimes panels is opened
      cy.getByTestId('openRuntimeSettings').click();
      cy.getByTestId('runtimesList').children().first().click();

      // THEN the runtime is running
      cy.getByTestId('runtimeInfoPanel').should('exist');
      cy.getByTestId('capabilitiesTag').contains(capability.name);

      // WHEN change selected capability
      cy.getByTestId('capabilitiesCrumb').click();
      cy.contains(capability2.name).click();

      // and the action is confirmed
      cy.contains('Replace Capabilities').click();

      // THEN
      cy.getByTestId('capabilitiesTag').contains(capability2.name);
    });
  });
});
