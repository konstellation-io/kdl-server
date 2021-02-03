import LogViewer from './LogViewer';
import React from 'react';
import { shallow } from 'enzyme';

const logs = [
  {
    text: 'log line 1',
    isError: false,
  },
  {
    text: 'log line 2',
    isError: true,
  },
];

const component = shallow(<LogViewer logs={logs} />);

describe('LogViewer component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    expect(component.contains('log line 1')).toBeTruthy();
    expect(component.contains('log line 2')).toBeTruthy();
  });

  it('show error logs', () => {
    expect(component.find('.error').length).toBe(1);
  });
});
