import { ErrorMessage, ModalContainer, ModalLayoutConfirmList, SpinnerCircular } from 'kwc';
import AdminEmail from './components/AdminEmail/AdminEmail';

import AddProject from './components/Project/AddProject';
import { GetProjects } from 'Graphql/queries/types/GetProjects';
import Project from './components/Project/Project';
import ProjectsBar from 'Components/ProjectsBar/ProjectsBar';
import React, { useState } from 'react';
import styles from './Projects.module.scss';
import useProjectFilters from 'Graphql/client/hooks/useProjectFilters';
import { useQuery, useReactiveVar } from '@apollo/client';

import GetProjectsQuery from 'Graphql/queries/getProjects';
import { projectFilters } from 'Graphql/client/cache';

export type ProjectAdmins = {
  projectName: string;
  administrators: string[];
};

function Projects() {
  const [showProjectAdmins, setShowProjectAdmins] = useState<ProjectAdmins | null>(null);

  const { data, error, loading } = useQuery<GetProjects>(GetProjectsQuery);
  const filters = useReactiveVar(projectFilters);

  const { filterProjects, sortProjects } = useProjectFilters();
  if (loading) return <SpinnerCircular />;
  if (error || !data) return <ErrorMessage />;

  let projects = filterProjects(data.projects, filters);
  projects = sortProjects(projects, filters.order);

  return (
    <>
      <ProjectsBar />
      <div className={styles.container}>
        {[
          ...projects.map((project) => (
            <Project key={project.id} project={project} showAdmins={setShowProjectAdmins} />
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
              <AdminEmail email={email} key={email} />
            ))}
          </ModalLayoutConfirmList>
        </ModalContainer>
      )}
    </>
  );
}

export default Projects;
