import 'mutationobserver-shim';
import '@testing-library/jest-dom/extend-expect';
import 'jest-canvas-mock';

import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';

configure({ adapter: new Adapter() });
