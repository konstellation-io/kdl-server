import { AccessLevel } from 'Graphql/types/globalTypes';

export const mapAccessLevel = {
  [AccessLevel.ADMIN]: 'Owner',
  [AccessLevel.MANAGER]: 'Developer',
  [AccessLevel.VIEWER]: 'Member',
}
