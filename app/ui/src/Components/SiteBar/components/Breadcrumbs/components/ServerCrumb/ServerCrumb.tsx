import React from 'react';
import { useQuery } from '@apollo/client';
import { GetMe } from 'Graphql/queries/types/GetMe';
import GetMeQuery from 'Graphql/queries/getMe';
import { RouteConfiguration } from 'Hooks/useProjectNavigation';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ROUTE from 'Constants/routes';
import PersonIcon from '@material-ui/icons/Person';
import { AccessLevel } from 'Graphql/types/globalTypes';
import Crumb, { BottomComponentProps } from '../Crumb/Crumb';
import { CONFIG } from 'index';
import ServerIcon from 'Components/Icons/ServerIcon/ServerIcon';
import NavigationSelector from '../../../NavigationSelector/NavigationSelector';

const SECTION_PROJECTS: RouteConfiguration = {
  id: 'projects',
  label: 'Projects',
  Icon: ArrowForwardIcon,
  route: ROUTE.PROJECTS,
};
const SECTION_USERS: RouteConfiguration = {
  id: 'users',
  label: 'Users',
  Icon: PersonIcon,
  route: ROUTE.USERS,
};

function ServerCrumb() {
  const { data } = useQuery<GetMe>(GetMeQuery);
  const serverSections = [SECTION_PROJECTS];

  if (!data) return null;

  // Admin users can access Users section
  if (data.me.accessLevel === AccessLevel.ADMIN) {
    serverSections.push(SECTION_USERS);
  }

  return (
    <Crumb
      dataTestId="server"
      crumbText={CONFIG.SERVER_NAME}
      LeftIconComponent={<ServerIcon className="icon-regular" />}
    >
      {(props: BottomComponentProps) => (
        <NavigationSelector options={serverSections} {...props} />
      )}
    </Crumb>
  );
}

export default ServerCrumb;
