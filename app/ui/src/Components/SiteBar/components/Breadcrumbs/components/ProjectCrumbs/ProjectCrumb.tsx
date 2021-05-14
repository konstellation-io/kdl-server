import React from 'react';
import { useReactiveVar } from '@apollo/client';
import useProjectNavigation from 'Hooks/useProjectNavigation';
import Crumb, { BottomComponentProps } from '../Crumb/Crumb';
import NavigationSelector from '../../../NavigationSelector/NavigationSelector';
import { openedProject } from 'Graphql/client/cache';
import { useLocation } from 'react-router-dom';

function ProjectCrumb() {
  const location = useLocation();
  const project = useReactiveVar(openedProject);

  const { allRoutes } = useProjectNavigation(project?.id || '');

  const lastParam = location.pathname.split('/').pop();
  const projectRoute = allRoutes.find(({ id }) => id === lastParam);

  if (!projectRoute || !project) return null;

  const { label, Icon } = projectRoute;
  return (
    <Crumb
      crumbText={label}
      LeftIconComponent={<Icon className="icon-small" />}
    >
      {(props: BottomComponentProps) => (
        <NavigationSelector options={allRoutes} {...props} />
      )}
    </Crumb>
  );
}

export default ProjectCrumb;
