import {
  ErrorMessage,
  ModalContainer,
  ModalLayoutConfirmList,
  SpinnerCircular,
} from 'kwc';
import AdminEmail from './components/AdminEmail/AdminEmail';
import {
  GET_PROJECT_FILTERS,
  GetProjectFilters,
} from 'Graphql/client/queries/getProjectsFilters.graphql';

import AddProject from './components/Project/AddProject';
import { GetProjects } from 'Graphql/queries/types/GetProjects';
import Project from './components/Project/Project';
import ProjectsBar from 'Components/ProjectsBar/ProjectsBar';
import React, { useState } from 'react';
import { loader } from 'graphql.macro';
import styles from './Projects.module.scss';
import useProjectFilters from 'Graphql/client/hooks/useProjectFilters';
import { useQuery } from '@apollo/client';

const GetProjectsQuery = loader('Graphql/queries/getProjects.graphql');

export type ProjectAdmins = {
  projectName: string;
  administrators: string[];
};

function Projects() {
  const [
    showProjectAdmins,
    setShowProjectAdmins,
  ] = useState<ProjectAdmins | null>(null);

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
            <Project
              key={project.id}
              project={project}
              showAdmins={setShowProjectAdmins}
            />
          )),
          <AddProject key="add-project" />,
        ]}
      </div>
      {showProjectAdmins !== null && (
        <ModalContainer
          title={showProjectAdmins.projectName}
          actionButtonLabel="Close"
          actionButtonCancel="Cancel"
          onAccept={() => setShowProjectAdmins(null)}
          className={styles.adminsModal}
          blocking
        >
          <ModalLayoutConfirmList message="You can email the following users to ask for access to this project">
            {showProjectAdmins.administrators.map((email) => (
              <AdminEmail email={email} />
            ))}
          </ModalLayoutConfirmList>
        </ModalContainer>
      )}
    </>
  );
}

export default Projects;
