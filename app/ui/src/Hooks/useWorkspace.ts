export enum CONFIG {
  NAVIGATION_OPENED = 'NAVIGATION_OPENED',
}

type Workspace = {
  navigationOpened: boolean;
};

function useWorkspace(projectId: string): [Workspace, (type: CONFIG, value: boolean) => void] {
  function getBool(field: CONFIG, defaultValue: boolean) {
    const value = localStorage.getItem(`${projectId}-${field}`);
    return !value ? defaultValue : value === 'true';
  }

  const navigationOpened = getBool(CONFIG.NAVIGATION_OPENED, true);

  function saveConfiguration(type: CONFIG, value: boolean) {
    localStorage.setItem(`${projectId}-${type}`, `${value}`);
  }

  return [{ navigationOpened }, saveConfiguration];
}

export default useWorkspace;
