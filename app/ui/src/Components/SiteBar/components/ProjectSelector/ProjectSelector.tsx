import React, { FC } from 'react';
import styles from './ProjectSelector.module.scss';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { NavLink } from 'react-router-dom';
import ROUTE, { buildRoute } from 'Constants/routes';
import { Button } from 'kwc';
import IconAdd from '@material-ui/icons/Add';
import { BottomComponentProps } from '../Breadcrumbs/components/Crumb/Crumb';
import ConfirmAction from '../../../Layout/ConfirmAction/ConfirmAction';
import { useHistory } from 'react-router';

type Props = {
  options: GetProjects_projects[];
};
const ProjectSelector: FC<Props & BottomComponentProps> = ({
  options,
  closeComponent = () => {},
}) => {
  const history = useHistory();

  function handleAction(id: string) {
    closeComponent();
    history.push(buildRoute(ROUTE.PROJECT, id));
  }

  return (
    <div className={styles.container}>
      <ul>
        {options.map(({ id, name }: GetProjects_projects) => (
          <ConfirmAction
            title="WARNING"
            subtitle="You are going to leave the project page and you will loose your unsaved work, are you sure?"
            actionLabel="YES"
            action={() => handleAction(id)}
            key={id}
            warning
          >
            <NavLink
              to={buildRoute(ROUTE.PROJECT, id)}
              onClick={(event) => event.preventDefault()}
              activeClassName={styles.selectedProject}
              className={styles.project}
            >
              <li className={styles.projectName}>{name}</li>
            </NavLink>
          </ConfirmAction>
        ))}
      </ul>
      <Button
        Icon={IconAdd}
        label="NEW PROJECT"
        className={styles.addProjectButton}
        to={ROUTE.NEW_PROJECT}
      />
    </div>
  );
};
export default ProjectSelector;
