import React, { FC } from 'react';
import styles from './NavigationSelector.module.scss';
import { NavLink } from 'react-router-dom';
import { RouteConfiguration } from 'Hooks/useProjectNavigation';
import { BottomComponentProps } from '../Breadcrumbs/components/Crumb/Crumb';
import cx from 'classnames';
import NavListItem from './components/NavListItem/NavListItem';

type Props = {
  options: RouteConfiguration[];
};

const NavigationSelector: FC<Props & BottomComponentProps> = ({
  options,
  closeComponent,
}) => (
  <div className={styles.container}>
    <ul>
      {options.map(({ route, Icon, label, disabled, id }) => (
        <li
          key={label}
          className={cx({
            [styles.disabled]: disabled,
          })}
          data-testid={id}
        >
          <NavLink
            to={route}
            activeClassName={styles.selectedSection}
            className={styles.section}
            onClick={closeComponent}
            exact
          >
            <NavListItem label={label} Icon={Icon} disabled={disabled} />
          </NavLink>
        </li>
      ))}
    </ul>
  </div>
);
export default NavigationSelector;
