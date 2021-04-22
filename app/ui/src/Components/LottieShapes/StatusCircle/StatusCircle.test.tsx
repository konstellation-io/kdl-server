import StatusCircle, { States } from './StatusCircle';

import { Lottie } from 'kwc';
import React from 'react';
import { shallow } from 'enzyme';

const component = shallow(
  <StatusCircle animation={States.INITIALIZING} label="Some label" size={40} />
);

describe('StatusCircle component', () => {
  it('show right texts', () => {
    expect(component.contains('Some label')).toBeTruthy();
  });

  it('has right dimensions', () => {
    // Arrange.
    // Act.
    // Assert.
    expect(component.find('.loaderContainer').props().style.width).toBe(40);
    expect(component.find('.loaderContainer').props().style.height).toBe(40);
  });

  test('Initiallizing animations adds loading animation', () => {
    // Arrange.
    // Act.
    // Assert.
    expect(component.find(Lottie).props().segments.length).toBe(2);
  });

  test('non Initiallizing animations do not adds loading animation', () => {
    // Arrange.
    // Act.
    component.setProps({ animation: States.ALERT });

    // Assert.
    expect(component.find(Lottie).props().segments.length).toBe(1);
  });
});
