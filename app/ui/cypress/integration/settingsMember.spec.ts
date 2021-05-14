import { project1 } from '../../src/Mocks/entities/project';
import { userMe } from '../../src/Mocks/entities/user';
import { AccessLevel } from '../../src/Graphql/types/globalTypes';

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

  describe('Admin user behavior', () => {
    beforeEach(() => {
      // Arrange.
      const { me, project } = buildMockedData(AccessLevel.ADMIN);

      cy.kstInterceptor('GetMe', { data: { me } });
      cy.kstInterceptor('GetProjectMembers', { data: { project } });

      cy.openSettings();
      cy.getByTestId('members').click();
    });

    it('should show add member bar', () => {
      // Assert.
      cy.getByTestId('member').should('be.visible');
    });
  });
});
