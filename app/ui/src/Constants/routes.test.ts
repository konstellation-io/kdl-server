import ROUTE from 'Constants/routes';
import { buildRoute } from './routes';

describe('route utils - buildRoute', () => {
  test('right server routes', () => {
    const serverId = 'someServer';

    const route1 = buildRoute.server(ROUTE.NEW_SERVER, serverId);
    const route2 = buildRoute.server(ROUTE.USERS, serverId);

    const expectedRoute1 = '/new-server';
    const expectedRoute2 = '/server/someServer/users';

    expect(route1).toBe(expectedRoute1);
    expect(route2).toBe(expectedRoute2);
  });

  test('right project routes', () => {
    const serverId = 'someServer';
    const projectId = 'someProject';

    const route1 = buildRoute.project(ROUTE.NEW_SERVER, serverId, projectId);
    const route2 = buildRoute.project(ROUTE.PROJECT, serverId, projectId);

    const expectedRoute1 = '/new-server';
    const expectedRoute2 = '/server/someServer/project/someProject';

    expect(route1).toBe(expectedRoute1);
    expect(route2).toBe(expectedRoute2);
  });
});
