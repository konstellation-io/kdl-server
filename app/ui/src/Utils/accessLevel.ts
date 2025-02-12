import { AccessLevel } from 'Graphql/types/globalTypes';

export const mapProjectAccessLevel = {
  [AccessLevel.ADMIN]: 'Owner',
  [AccessLevel.MANAGER]: 'Developer',
  [AccessLevel.VIEWER]: 'Member',
}
