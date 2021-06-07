import 'mutationobserver-shim';
import '@testing-library/jest-dom/extend-expect';
import 'jest-canvas-mock';

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure } from 'enzyme';
import moment from 'moment-timezone';

jest.mock('index', () => ({
  CONFIG: {
    SERVER_NAME: 'KDL Server',
    SERVER_URL: 'kdl.server.com',
    GITEA_URL: 'kdl.gitea.com',
    RELEASE_VERSION: 'v1.2.3',
  },
}));

window.HTMLElement.prototype.scrollIntoView = function () {
  // This is intentional
};

configure({ adapter: new Adapter() });

moment.tz.setDefault('UTC');
