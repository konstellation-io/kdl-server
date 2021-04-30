import { openedSettingTab } from '../cache';
import { SettingTabs } from '../models/SettingTabs';

export default function useSettingTabs() {
  function updateSettingTab(tab: SettingTabs) {
    openedSettingTab(tab);
  }

  return { updateSettingTab };
}
