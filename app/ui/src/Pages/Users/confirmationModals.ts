import { AccessLevel } from 'Graphql/types/globalTypes';

export type ModalInfo = {
  action?: () => void;
  title: string;
  userIds: string[];
  message: string;
  acceptLabel: string;
};

export const defaultModalInfo: ModalInfo = {
  action: undefined,
  title: '',
  userIds: [],
  message: '',
  acceptLabel: '',
};

type setModalInfoParams = {
  type: 'delete' | 'update';
  action: () => void;
  nUsers: number;
  userIds: string[];
  plural: boolean;
  accessLevel?: AccessLevel;
};
export function getModalInfo({ type, action, nUsers, userIds, plural, accessLevel }: setModalInfoParams): ModalInfo {
  switch (type) {
    case 'delete':
      return {
        action,
        userIds,
        title: 'User deletion',
        message: `The following user${plural ? 's' : ''} will be deleted:`,
        acceptLabel: `Remove ${nUsers} user${plural ? 's' : ''}`,
      };
    case 'update':
      return {
        action,
        userIds,
        title: 'User access level update',
        message: `The following user${plural ? 's' : ''}' Access Level will be updated to ${accessLevel}:`,
        acceptLabel: `Update ${nUsers} user${plural ? 's' : ''}`,
      };
    default:
      return defaultModalInfo;
  }
}
