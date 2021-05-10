import 'mutationobserver-shim';
import '@testing-library/jest-dom/extend-expect';
import 'jest-canvas-mock';

import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';
import moment from 'moment-timezone';

window.HTMLElement.prototype.scrollIntoView = function () {
  // This is intentional
};

configure({ adapter: new Adapter() });

moment.tz.setDefault('UTC');
