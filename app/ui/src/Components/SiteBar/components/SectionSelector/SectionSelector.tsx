import React, { FC } from 'react';
import styles from './SectionSelector.module.scss';
import { NavLink } from 'react-router-dom';
import { EnhancedRouteConfiguration } from 'Hooks/useProjectNavigation';
import { BottomComponentProps } from '../Breadcrumbs/components/Crumb/Crumb';
import cx from 'classnames';
import NavListItem from './components/NavListItem/NavListItem';

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
        <li
          key={label}
          className={cx({
            [styles.disabled]: disabled,
          })}
        >
          <NavLink
            to={to}
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
export default SectionSelector;
