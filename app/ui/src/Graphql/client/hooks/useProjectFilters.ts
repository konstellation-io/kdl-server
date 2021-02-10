import {
  ProjectFilters,
  ProjectOrder,
  ProjectSelection,
} from '../models/ProjectFilters';

import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { ProjectState } from 'Graphql/types/globalTypes';
import { projectFilters } from './../cache';
import { sortBy } from 'lodash';

export type NewFilters = {
  name?: string;
  selection?: ProjectSelection;
  order?: ProjectOrder;
};

function useProjectFilters() {
  function updateFilters(newFilters: NewFilters) {
    const filters = projectFilters();

    projectFilters({
      ...filters,
      ...newFilters,
    });
  }

  const isProjectActive = (project: GetProjects_projects) =>
    project.state !== ProjectState.ARCHIVED;
  const isProjectStarred = (project: GetProjects_projects) => project.favorite;
  const isProjectArchived = (project: GetProjects_projects) =>
    project.state === ProjectState.ARCHIVED;

  function getProjectCounts(projects: GetProjects_projects[]) {
    const activeProjects = projects.filter(isProjectActive);
    const starredProjects = projects.filter(isProjectStarred);
    const archivedProjects = projects.filter(isProjectArchived);

    return new Map([
      [ProjectSelection.ALL, projects.length],
      [ProjectSelection.ACTIVE, activeProjects.length],
      [ProjectSelection.STARRED, starredProjects.length],
      [ProjectSelection.ARCHIVED, archivedProjects.length],
    ]);
  }

  function filterBySelection(
    project: GetProjects_projects,
    selection: ProjectSelection
  ) {
    if (selection === ProjectSelection.ALL) return true;

    return (
      (selection === ProjectSelection.ARCHIVED && isProjectArchived(project)) ||
      (selection === ProjectSelection.ACTIVE && isProjectActive(project)) ||
      (selection === ProjectSelection.STARRED && isProjectStarred(project))
    );
  }

  function filterProjects(
    projects: GetProjects_projects[],
    filters: ProjectFilters
  ) {
    let filteredProjects = projects
      .filter((project) => project.name.includes(filters.name))
      .filter((project) => filterBySelection(project, filters.selection));

    projectFilters({
      ...filters,
      nFiltered: filteredProjects.length,
    });

    return filteredProjects;
  }

  function sortProjects(projects: GetProjects_projects[], order: ProjectOrder) {
    let sortedProjects: GetProjects_projects[];

    switch (order) {
      case ProjectOrder.AZ:
        sortedProjects = sortBy(projects, (p) => p.name);
        break;
      case ProjectOrder.ZA:
        sortedProjects = sortBy(projects, (p) => p.name).reverse();
        break;
      case ProjectOrder.CREATION:
        sortedProjects = sortBy(projects, (p) => p.creationDate);
        break;
      default:
        sortedProjects = sortBy(projects, (p) => p.name);
    }

    return sortedProjects;
  }

  return { updateFilters, filterProjects, getProjectCounts, sortProjects };
}

export default useProjectFilters;
