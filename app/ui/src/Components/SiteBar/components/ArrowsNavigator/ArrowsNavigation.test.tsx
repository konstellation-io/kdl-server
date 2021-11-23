import * as React from 'react';
import ArrowsNavigator from './ArrowsNavigator';
import { shallow } from 'enzyme';
import { Button } from 'kwc';

const mockOnBackClick = jest.fn();
const mockOnForwardClick = jest.fn();
jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    goBack: mockOnBackClick,
    goForward: mockOnForwardClick,
  }),
}));

const component = shallow(<ArrowsNavigator />);

describe('ProjectsBar component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  beforeEach(() => {
    mockOnBackClick.mockClear();
    mockOnForwardClick.mockClear();
  });

  it('should call back function when clicking back button', () => {
    // Arrange.
    const backButton = component.find(Button).first();

    // Act.
    backButton.simulate('click');

    // Assert.
    expect(mockOnBackClick).toHaveBeenCalled();
    expect(mockOnForwardClick).not.toHaveBeenCalled();
  });

  it('should call forward function when clicking forward button', () => {
    // Arrange.
    const forwardButton = component.find(Button).last();

    // Act.
    forwardButton.simulate('click');

    // Assert.
    expect(mockOnForwardClick).toHaveBeenCalled();
    expect(mockOnBackClick).not.toHaveBeenCalled();
  });
});
