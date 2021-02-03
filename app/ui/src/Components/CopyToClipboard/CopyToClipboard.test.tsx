import * as clipboard from 'Utils/clipboard';

import CopyToClipboard from './CopyToClipboard';
import React from 'react';
import { shallow } from 'enzyme';

let component;
const textToCopy = 'foo';

beforeEach(() => {
  component = shallow(<CopyToClipboard>{textToCopy}</CopyToClipboard>);
});
describe('CopyToClipboard component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('copy text on click', () => {
    // Arrange.
    const mockCopyAndToast = jest.fn();
    clipboard.copyAndToast = mockCopyAndToast;

    // Act.
    component.simulate('click');

    // Assert.
    expect(mockCopyAndToast).toHaveBeenCalledTimes(1);
    expect(mockCopyAndToast).toHaveBeenCalledWith(textToCopy);
  });
});
