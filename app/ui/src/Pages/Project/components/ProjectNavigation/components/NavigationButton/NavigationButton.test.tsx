import React from 'react';
import NavigationButton, { IconSize } from './NavigationButton';
import Icon from '@material-ui/icons/Close';
import { shallow } from 'enzyme';

const component = shallow(
  <NavigationButton
    label="some label"
    Icon={Icon}
    title="some title"
    iconSize={IconSize.SMALL}
    onClick={jest.fn()}
    className="someClass"
    disabled={false}
  />
);

describe('NavigationButton component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });
});
