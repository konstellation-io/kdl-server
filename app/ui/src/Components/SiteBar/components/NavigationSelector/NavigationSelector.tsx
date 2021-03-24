import React, { FC } from 'react';
import styles from './NavigationSelector.module.scss';
import { NavLink } from 'react-router-dom';
import { EnhancedRouteConfiguration } from 'Hooks/useProjectNavigation';
import { BottomComponentProps } from '../Breadcrumbs/components/Crumb/Crumb';
import cx from 'classnames';
import NavListItem from './components/NavListItem/NavListItem';
import ConfirmAction from '../../../Layout/ConfirmAction/ConfirmAction';
import { useHistory } from 'react-router';

type Props = {
  options: EnhancedRouteConfiguration[];
  shouldShowConfirmation?: boolean;
};

const NavigationSelector: FC<Props & BottomComponentProps> = ({
  options,
  closeComponent,
  shouldShowConfirmation = false,
}) => {
  const history = useHistory();

  function handleConfirmation(to: string) {
    history.push(to);
    closeComponent();
  }
  return (
    <div className={styles.container}>
      <ul>
        {options.map(({ to, Icon, label, disabled }) => (
          <li
            key={label}
            className={cx({
              [styles.disabled]: disabled,
            })}
          >
            <ConfirmAction
              title="WARNING"
              subtitle="You are going to leave the project page and you will loose your unsaved work, are you sure?"
              actionLabel="YES"
              action={() => handleConfirmation(to)}
              skipConfirmation={!shouldShowConfirmation}
              warning
            >
              <NavLink
                to={to}
                activeClassName={styles.selectedSection}
                className={styles.section}
                onClick={(event) => event.preventDefault()}
                exact
              >
                <NavListItem label={label} Icon={Icon} disabled={disabled} />
              </NavLink>
            </ConfirmAction>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default NavigationSelector;
