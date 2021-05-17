import React from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import Crumb, { BottomComponentProps } from '../Crumb/Crumb';
import { GetProjects } from 'Graphql/queries/types/GetProjects';
import GetProjectsQuery from 'Graphql/queries/getProjects';
import { openedProject } from 'Graphql/client/cache';
import ProjectIcon from 'Components/Icons/ProjectIcon/ProjectIcon';
import ProjectSelector from '../../../ProjectSelector/ProjectSelector';

function ProjectsCrumb() {
  const { data, loading, error } = useQuery<GetProjects>(GetProjectsQuery);
  const project = useReactiveVar(openedProject);

  if (loading || !project || !data) return null;
  if (error) throw Error('cannot retrieve data at ProjectsCrumb');

  const activeProjects = data.projects.filter(
    (p) => !p.archived && !p.needAccess
  );

  return (
    <Crumb
      crumbText={project.name}
      LeftIconComponent={
        <ProjectIcon className="icon-regular" archived={project.archived} />
      }
    >
      {(props: BottomComponentProps) => (
        <ProjectSelector options={activeProjects} {...props} />
      )}
    </Crumb>
  );
}

export default ProjectsCrumb;
