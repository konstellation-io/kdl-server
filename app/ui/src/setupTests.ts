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
    KNOWLEDGE_GALAXY_ENABLED: true,
    RELEASE_VERSION: 'v1.2.3',
    DESCRIPTION_MIN_WORDS: 50,
  },
}));

window.HTMLElement.prototype.scrollIntoView = function () {
  // This is intentional
};

configure({ adapter: new Adapter() });

moment.tz.setDefault('UTC');
