import ROUTE from 'Constants/routes';
import { buildRoute } from './routes';

describe('route utils - buildRoute', () => {
  test('right server routes', () => {
    const route1 = ROUTE.NEW_SERVER;
    const route2 = ROUTE.USERS;

    const expectedRoute1 = '/new-server';
    const expectedRoute2 = '/server/someServer/users';

    expect(route1).toBe(expectedRoute1);
    expect(route2).toBe(expectedRoute2);
  });

  test('right project routes', () => {
    const serverId = 'someServer';
    const projectId = 'someProject';

    const route1 = buildRoute(ROUTE.NEW_SERVER, projectId);
    const route2 = buildRoute(ROUTE.PROJECT, projectId);

    const expectedRoute1 = '/new-server';
    const expectedRoute2 = '/server/someServer/project/someProject';

    expect(route1).toBe(expectedRoute1);
    expect(route2).toBe(expectedRoute2);
  });
});
