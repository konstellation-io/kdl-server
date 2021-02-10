export enum CONFIG {
  NAVIGATION_OPENED = 'NAVIGATION_OPENED',
}

function useWorkspace(projectId: string) {
  const navigationOpened =
    localStorage.getItem(`${projectId}-${CONFIG.NAVIGATION_OPENED}`) === 'true';

  function saveConfiguration(type: CONFIG, value: string | boolean) {
    localStorage.setItem(`${projectId}-${type}`, `${value}`);
  }

  return { saveConfiguration, navigationOpened };
}

export default useWorkspace;
