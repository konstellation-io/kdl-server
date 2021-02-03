import React, { FC } from 'react';
import styles from './SectionSelector.module.scss';
import { NavLink } from 'react-router-dom';
import { EnhancedRouteConfiguration } from 'Hooks/useProjectNavigation';
import { BottomComponentProps } from '../Breadcrumbs/components/Crumb/Crumb';
import NavigationButton, {
  IconSize,
} from '../../../../pages/Project/components/ProjectNavigation/NavigationButton';

type Props = {
  options: EnhancedRouteConfiguration[];
};

const SectionSelector: FC<Props & BottomComponentProps> = ({
  options,
  closeComponent,
}) => (
  <div className={styles.container}>
    <ul>
      {options.map(({ to, Icon, label }) => (
        <NavLink
          to={to}
          key={label}
          activeClassName={styles.selectedSection}
          className={styles.section}
          onClick={closeComponent}
        >
          <NavigationButton
            label={label}
            Icon={Icon}
            iconSize={IconSize.SMALL}
          />
        </NavLink>
      ))}
    </ul>
  </div>
);
export default SectionSelector;
