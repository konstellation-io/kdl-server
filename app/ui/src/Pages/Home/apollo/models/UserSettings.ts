import { AccessLevel } from 'Graphql/types/globalTypes';

export interface UserSettings {
  selectedUserIds: string[];
  userSelection: UserSelection;
  filters: UserSettingsFilters;
}

export interface UserSettingsFilters {
  email: string | null;
  accessLevel: AccessLevel | null;
}

export enum UserSelection {
  ALL,
  INDETERMINATE,
  NONE,
}
