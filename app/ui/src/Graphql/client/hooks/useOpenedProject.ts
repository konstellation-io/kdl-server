import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { openedProject } from './../cache';

function useOpenedProject() {
  function updateOpenedProject(newProject: GetProjects_projects | null) {
    if (newProject === null) {
      openedProject(null);
    } else {
      openedProject({
        ...newProject,
      });
    }
  }

  return { updateOpenedProject };
}

export default useOpenedProject;
