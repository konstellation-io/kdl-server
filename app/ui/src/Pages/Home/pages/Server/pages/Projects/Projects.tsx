import { ErrorMessage, SpinnerCircular } from 'kwc';
import {
  GET_PROJECT_FILTERS,
  GetProjectFilters,
} from 'Graphql/client/queries/getProjectsFilters.graphql';

import AddProject from './components/Project/AddProject';
import { GetProjects } from 'Graphql/queries/types/GetProjects';
import Project from './components/Project/Project';
import ProjectsBar from '../../components/ProjectsBar/ProjectsBar';
import React from 'react';
import { loader } from 'graphql.macro';
import styles from './Projects.module.scss';
import useProjectFilters from 'Pages/Home/apollo/hooks/useProjectFilters';
import { useQuery } from '@apollo/client';

const GetProjectsQuery = loader('Graphql/queries/getProjects.graphql');
function Projects() {
  const { data, error, loading } = useQuery<GetProjects>(GetProjectsQuery);
  const { data: projectFiltersData } = useQuery<GetProjectFilters>(
    GET_PROJECT_FILTERS
  );

  const { filterProjects, sortProjects } = useProjectFilters();

  if (loading) return <SpinnerCircular />;
  if (error || !data || !projectFiltersData) return <ErrorMessage />;

  const filters = projectFiltersData.projectFilters;
  let projects = filterProjects(data.projects, filters);
  projects = sortProjects(projects, filters.order);

  return (
    <>
      <ProjectsBar />
      <div className={styles.container}>
        {[
          ...projects.map((project) => (
            <Project key={project.id} project={project} />
          )),
          <AddProject key="add-project" />,
        ]}
      </div>
    </>
  );
}

export default Projects;
