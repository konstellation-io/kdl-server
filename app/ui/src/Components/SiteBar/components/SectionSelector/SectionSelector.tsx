import React, { FC } from 'react';
import styles from './SectionSelector.module.scss';
import projectNavigationStyles from 'Pages/Project/components/ProjectNavigation/ProjectNavigation.module.scss';
import { NavLink } from 'react-router-dom';
import { EnhancedRouteConfiguration } from 'Hooks/useProjectNavigation';
import { BottomComponentProps } from '../Breadcrumbs/components/Crumb/Crumb';
import NavigationButton, {
  IconSize,
} from 'Pages/Project/components/ProjectNavigation/NavigationButton';
import cx from 'classnames';

type Props = {
  options: EnhancedRouteConfiguration[];
};

const SectionSelector: FC<Props & BottomComponentProps> = ({
  options,
  closeComponent,
}) => (
  <div className={styles.container}>
    <ul>
      {options.map(({ to, Icon, label, disabled }) => (
        <NavLink
          to={to}
          key={label}
          activeClassName={styles.selectedSection}
          className={cx(styles.section, {
            [projectNavigationStyles.disabled]: disabled,
          })}
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
