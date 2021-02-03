import RemoteServer, { RemoteServerStates } from './RemoteServer';

import ActionButton from './ActionButton';
import AddServer from './AddServer';
import Icon from '@material-ui/icons/Archive';
import { Link } from 'react-router-dom';
import LocalServer from './LocalServer';
import { LocalServerStates } from './LocalServer';
import React from 'react';
import Server from './Server';
import { shallow } from 'enzyme';

const onActionClickMock = jest.fn();
const mockOnHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
  Link: () => <div></div>,
  useHistory: jest.fn(() => ({
    push: mockOnHistoryPush,
  })),
}));

const actions = [
  {
    label: 'Some label',
    Icon: Icon,
    onClick: onActionClickMock,
  },
  {
    label: 'Some label 2',
    Icon: Icon,
    to: '/home-2',
  },
];

describe('Server component', () => {
  let component;

  beforeEach(() => {
    component = shallow(
      <Server
        serverId="ServerId"
        name="ServerName"
        url="ServerUrl"
        warning={true}
        state={LocalServerStates.STOPPED}
        actions={actions}
        local={true}
        onOpenUrl={null}
      />
    );
  });

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    expect(component.contains('STOPPED')).toBeTruthy();
    expect(component.contains('ServerName')).toBeTruthy();
    expect(component.contains('ServerUrl')).toBeTruthy();
  });

  test('url is hidden when non available', () => {
    expect(component.find('.url').isEmptyRender()).toBeFalsy();
    component.setProps({ url: undefined });
    expect(component.find('.url').isEmptyRender()).toBeTruthy();
  });

  test('localTag is hidden when non available', () => {
    expect(component.find('.localTag').isEmptyRender()).toBeFalsy();
    component.setProps({ local: false });
    expect(component.find('.localTag').isEmptyRender()).toBeTruthy();
  });

  test('warning is hidden when non available', () => {
    expect(component.find('.warning').isEmptyRender()).toBeFalsy();
    component.setProps({ warning: false });
    expect(component.find('.warning').isEmptyRender()).toBeTruthy();
  });

  test('actions are hidden when non available', () => {
    expect(component.find(ActionButton).length).toBe(2);
    component.setProps({ actions: [] });
    expect(component.find(ActionButton).length).toBe(0);
  });

  test('should be a link when onOpenUrl is set', () => {
    expect(component.find('.cannotOpen').isEmptyRender()).toBeFalsy();

    component.setProps({ onOpenUrl: 'some.url' });
    expect(component).toMatchSnapshot();

    expect(component.find('.cannotOpen').isEmptyRender()).toBeTruthy();
    expect(component.find(Link).isEmptyRender()).toBeFalsy();
  });
});

describe('ActionButton component', () => {
  let component;

  beforeEach(() => {
    component = shallow(<ActionButton {...actions[0]} />);
    onActionClickMock.mockClear();
  });

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    expect(component.contains('Some label')).toBeTruthy();
  });

  test('should handle onClick events', () => {
    component.find('.actionButtonBg').simulate('click');

    expect(onActionClickMock).toHaveBeenCalledTimes(1);
  });

  test('should redirect when link', () => {
    component.setProps({ ...actions[1], onClick: undefined });

    component.find('.actionButtonBg').simulate('click');
    expect(onActionClickMock).toHaveBeenCalledTimes(0);
    expect(mockOnHistoryPush).toHaveBeenCalledTimes(1);
  });
});

describe('AddServer component', () => {
  let component;

  beforeEach(() => {
    component = shallow(<AddServer label="Some label" to="/home" />);
    mockOnHistoryPush.mockClear();
  });

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  test('should handle onClick events', () => {
    component.find('.addServerBg').simulate('click');

    expect(mockOnHistoryPush).toHaveBeenCalledTimes(1);
  });
});

describe('RemoteServer component', () => {
  let component;

  beforeEach(() => {
    component = shallow(
      <RemoteServer
        serverId="serverId"
        name="Some name"
        actions={[]}
        state={RemoteServerStates.SIGNED_IN}
        url="some.url"
      />
    );
  });

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });
});

describe('LocalServer component', () => {
  let component;

  beforeEach(() => {
    component = shallow(
      <LocalServer
        serverId="serverId"
        name="Some name"
        actions={[]}
        state={LocalServerStates.STARTED}
      />
    );
  });

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });
});
