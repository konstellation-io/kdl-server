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
import useBoolState from 'Hooks/useBoolState';

import GetProjectsQuery from 'Graphql/queries/getProjects';
import GetMeQuery from 'Graphql/queries/getMe';
import { GetMe } from 'Graphql/queries/types/GetMe';
import { projectFilters } from 'Graphql/client/cache';

import { AccessLevel } from 'Graphql/types/globalTypes';

export type ProjectAdmins = {
  projectName: string;
  administrators: string[];
};

function Projects() {
  const [showProjectAdmins, setShowProjectAdmins] = useState<ProjectAdmins | null>(null);

  const { data, error, loading } = useQuery<GetProjects>(GetProjectsQuery);
  const { data: dataMe, error: errorMe, loading: loadingMe } = useQuery<GetMe>(GetMeQuery);
  const filters = useReactiveVar(projectFilters);

  const { filterProjects, sortProjects } = useProjectFilters();
  if (loading) return <SpinnerCircular />;
  if (error || !data) return <ErrorMessage />;

  let projects = filterProjects(data.projects, filters);
  projects = sortProjects(projects, filters.order);

  const canAccessUsers = dataMe?.me?.accessLevel != AccessLevel.VIEWER;

  return (
    <>
      <ProjectsBar canAccessUser={canAccessUsers} />
      <div className={styles.container}>
        {[
          ...projects.map((project) => (
            <Project key={project.id} project={project} showAdmins={setShowProjectAdmins} />
          )),
          canAccessUsers && <AddProject key="add-project" />,
        ]}
      </div>
      {showProjectAdmins && (
        <ModalContainer
          title={showProjectAdmins.projectName}
          actionButtonLabel="Close"
          actionButtonCancel="Cancel"
          onAccept={() => setShowProjectAdmins(null)}
          onCancel={() => setShowProjectAdmins(null)}
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
