import { openedSettingTab } from '../cache';
import { SettingsTab } from '../models/SettingsTab';

export default function useSettingTabs() {
  function updateSettingTab(tab: SettingsTab) {
    openedSettingTab(tab);
  }

  return { updateSettingTab };
}
