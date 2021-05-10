import React from 'react';
import { StaticRouter } from 'react-router';
import Project from './Project';
import { projectNoAccess } from 'Mocks/entities/project';
import { mount } from 'enzyme';

const mockShowAdmins = jest.fn();

const component = mount(
  <StaticRouter>
    <Project project={projectNoAccess} showAdmins={mockShowAdmins} />
  </StaticRouter>
);

describe('Project component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('should show admins when clicking on admins button', function () {
    component.find('[data-testid="showAdminsButton"]').simulate('click');

    expect(mockShowAdmins).toHaveBeenCalled();
  });
});
