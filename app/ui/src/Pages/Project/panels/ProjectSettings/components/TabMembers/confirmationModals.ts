import { AccessLevel } from 'Graphql/types/globalTypes';

export type ModalInfo = {
  action?: () => void;
  title: string;
  message: string;
  acceptLabel: string;
  warning: boolean;
  error: boolean;
};

export const defaultModalInfo: ModalInfo = {
  action: undefined,
  title: '',
  message: '',
  acceptLabel: '',
  warning: false,
  error: false,
};

type setModalInfoParams = {
  type: 'remove' | 'update';
  action: () => void;
  nMembers: number;
  accessLevel?: AccessLevel;
};
export function getModalInfo({
  type,
  action,
  nMembers,
  accessLevel,
}: setModalInfoParams): ModalInfo {
  switch (type) {
    case 'remove':
      const messageDelete =
        nMembers > 1
          ? `The following members will be removed from the project:`
          : `The following member will be removed from the project:`;
      const acceptLabelDelete =
        nMembers > 1
          ? `Remove ${nMembers} members`
          : `Remove ${nMembers} member`;
      return {
        action,
        title: 'Members deletion',
        message: messageDelete,
        acceptLabel: acceptLabelDelete,
        warning: false,
        error: true,
      };
    case 'update':
      const messageUpdate =
        nMembers > 1
          ? `The following members access levels will be updated to the level of ${accessLevel}:`
          : `The following member access levels will be updated to the level of ${accessLevel}:`;
      const acceptLabelUpdate =
        nMembers > 1
          ? `Change ${nMembers} members`
          : `Change ${nMembers} member`;
      return {
        action,
        title: 'Members access level update',
        message: messageUpdate,
        acceptLabel: acceptLabelUpdate,
        warning: true,
        error: false,
      };
    default:
      return defaultModalInfo;
  }
}
