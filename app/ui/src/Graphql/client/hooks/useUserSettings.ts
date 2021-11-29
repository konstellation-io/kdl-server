import { AccessLevel } from 'Graphql/types/globalTypes';
import { UserSelection } from '../models/UserSettings';
import { userSettings } from '../cache';

function useUserSettings() {
  function changeUserSelection(newSelection: UserSelection) {
    userSettings({
      ...userSettings(),
      userSelection: newSelection,
    });
  }

  function updateSelection(selectedUserIds: string[], userSelection: UserSelection) {
    userSettings({
      ...userSettings(),
      selectedUserIds,
      userSelection,
    });
  }

  function updateFilters(email: string | null = null, accessLevel: AccessLevel | null = null) {
    const prevSettings = userSettings();
    userSettings({
      ...prevSettings,
      filters: { ...prevSettings.filters, email, accessLevel },
    });
  }

  return {
    changeUserSelection,
    updateSelection,
    updateFilters,
  };
}

export default useUserSettings;
