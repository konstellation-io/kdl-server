import StatusCircle, { States } from './StatusCircle';

import { Lottie } from 'kwc';
import React from 'react';
import { shallow } from 'enzyme';

const component = shallow(
  <StatusCircle animation={States.INITIALIZING} label="Some label" size={40} />
);

describe('StatusCircle component', () => {
  it('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    expect(component.contains('Some label')).toBeTruthy();
  });

  it('has right dimensions', () => {
    expect(component.find('.loaderContainer').props().style.width).toBe(40);
    expect(component.find('.loaderContainer').props().style.height).toBe(40);
  });

  test('Initiallizing animations adds loading animation', () => {
    expect(component.find(Lottie).props().segments.length).toBe(2);
  });

  test('non Initiallizing animations do not adds loading animation', () => {
    component.setProps({ animation: States.ALERT });

    expect(component.find(Lottie).props().segments.length).toBe(1);
  });
});
