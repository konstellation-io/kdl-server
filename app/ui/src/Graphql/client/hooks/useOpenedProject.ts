import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { openedProject } from '../cache';

function useOpenedProject() {
  function updateOpenedProject(newProject: GetProjects_projects | null) {
    openedProject(newProject);
  }

  return { updateOpenedProject };
}

export default useOpenedProject;
