import { AccessLevel } from 'Graphql/types/globalTypes';

export interface MemberDetails {
  id: string;
  email: string;
  accessLevel: AccessLevel;
  addedDate: string;
  lastActivity: string | null;
}
