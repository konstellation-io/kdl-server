import DefaultPage from './DefaultPage';
import React from 'react';
import { shallow } from 'enzyme';

const component = shallow(
  <DefaultPage
    title="Some title"
    subtitle="Some subtitle"
    actions={[<div key="k1">Action 1</div>, <div key="k2" />]}
  >
    <div id="children">Children</div>
  </DefaultPage>
);

describe('DefaultPage component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    expect(component.contains('Children')).toBeTruthy();
    expect(component.contains('Action 1')).toBeTruthy();
  });
});
