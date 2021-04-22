import ROUTE from 'Constants/routes';
import { buildRoute } from './routes';

describe('route utils - buildRoute', () => {
  test('right project routes', () => {
    // Arrange.
    // Act.
    const projectId = 'someProject';

    const route1 = buildRoute(ROUTE.PROJECT, projectId);
    const expectedRoute1 = '/projects/someProject';

    // Assert.
    expect(route1).toBe(expectedRoute1);
  });
});
