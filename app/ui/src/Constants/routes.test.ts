import ROUTE from 'Constants/routes';
import { buildRoute } from './routes';

describe('route utils - buildRoute', () => {
  test('right project routes', () => {
    const projectId = 'someProject';

    const route1 = buildRoute(ROUTE.PROJECT, projectId);

    const expectedRoute1 = '/project/someProject';

    expect(route1).toBe(expectedRoute1);
  });
});
