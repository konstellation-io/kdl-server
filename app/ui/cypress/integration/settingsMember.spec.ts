import { project1 } from '../../src/Mocks/entities/project';
import { newUser, userMe } from '../../src/Mocks/entities/user';
import { AccessLevel } from '../../src/Graphql/types/globalTypes';
import { newMember } from '../../src/Mocks/entities/member';

function buildMockedData(myAccessLevel: AccessLevel) {
  const meAsMember = { ...project1.members[0], accessLevel: myAccessLevel };
  const { email, id } = meAsMember.user;
  const me = { ...userMe, email, id };
  const members = [meAsMember, project1.members[1]];
  const project = { ...project1, members };

  return { me, project };
}

describe('Settings Members Behavior', () => {
  beforeEach(() => {
    cy.kstInterceptor('GetProjects', { data: { projects: [project1] } });
  });

  describe('Not admin member behavior', () => {
    it('should hide add member bar when the user is not an admin', () => {
      // Arrange.
      const { me, project } = buildMockedData(AccessLevel.VIEWER);
      cy.kstInterceptor('GetMe', { data: { me } });
      cy.kstInterceptor('GetProjectMembers', { data: { project } });

      cy.openSettings();

      // Act.
      cy.getByTestId('members').click();

      // Assert.
      cy.getByTestId('member').should('be.visible');
      cy.getByTestId('addMembers').should('not.exist');
    });
  });

  describe('Admin member behavior', () => {
    const newRole = 'Viewer';
    const { me, project } = buildMockedData(AccessLevel.ADMIN);

    beforeEach(() => {
      // Arrange.
      const updatedMember = { ...project.members[1], accessLevel: newRole };
      const updateMembers = {
        ...project,
        members: [project.members[0], updatedMember],
      };
      cy.kstInterceptor('GetMe', { data: { me } });
      cy.kstInterceptor('GetProjectMembers', { data: { project } });
      cy.kstInterceptor('UpdateMembers', { data: { updateMembers } });

      cy.openSettings();
      cy.getByTestId('members').click();

      cy.getByTestId('member').eq(1).as('secondMember');
    });

    it('should show add member bar', () => {
      // Assert.
      cy.getByTestId('member').should('be.visible');
    });

    it('should update the member table when the admin change one member role', () => {
      // Arrange.
      cy.get('@secondMember').findByTestId('roleSelector').as('roleSelector');

      // Act.
      // Click on the role selector of the second member (the first is me)
      cy.get('@roleSelector')
        .click()
        .contains(newRole, { matchCase: false })
        .click();

      // Assert.
      cy.get('@roleSelector').invoke('text').should('equal', newRole);
    });

    it('should update the member table when the admin change one member role using the checkbox', () => {
      // Arrange.
      cy.get('@secondMember').find('div').first().click();
      cy.getByTestId('manageMembersActions').click().contains(newRole).click();

      // Act.
      cy.get('.modal').contains('Change 1 member').click();

      // Assert.
      cy.get('@secondMember')
        .findByTestId('roleSelector')
        .invoke('text')
        .should('equal', newRole);
    });

    it('should update the member table when the admin add a new member', () => {
      // Arrange.
      const addMembers = {
        ...project,
        members: [...project.members, newMember],
      };
      cy.kstInterceptor('AddMembers', { data: { addMembers } });
      cy.getByTestId('addMembers').find('input').type('a');
      cy.getByTestId('addMembers').find('ul > li').first().click();

      // Act.
      cy.getByTestId('addMembers').contains('Add').click();

      // Assert.
      cy.getByTestId('tabMembers').should('contain', newUser.email);
    });

    it('should update the member table when the admin remove one member', () => {
      // Arrange.
      const removeMembers = {
        ...project,
        members: [project.members[0]],
      };
      cy.kstInterceptor('RemoveMembers', { data: { removeMembers } });
      cy.get('@secondMember').find('div').first().click();
      cy.getByTestId('manageMembersActions')
        .click()
        .findByTestId('removeMembers')
        .click();

      // Act.
      cy.get('.modal').contains('Remove 1 member').click();

      // Assert.
      cy.get('@secondMember').should('not.exist');
    });
  });
});
