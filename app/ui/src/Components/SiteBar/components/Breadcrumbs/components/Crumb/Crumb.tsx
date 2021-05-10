import React, { FC } from 'react';
import styles from './Crumb.module.scss';
import cx from 'classnames';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import useBoolState from 'Hooks/useBoolState';
import ExpandableMenu from 'Components/ExpandableMenu/ExpandableMenu';

export interface BottomComponentProps {
  closeComponent: () => void;
}
export type CrumbProps = {
  dataTestId?: string;
  crumbText: string;
  LeftIconComponent: React.ReactElement;
  BottomComponent: FC<BottomComponentProps>;
};

function Crumb({
  crumbText,
  LeftIconComponent,
  BottomComponent,
  dataTestId,
}: CrumbProps) {
  const {
    value: opened,
    toggle: toggleComponent,
    deactivate: hideComponent,
  } = useBoolState(false);

  return (
    <div
      className={styles.container}
      onClick={toggleComponent}
      data-testid={dataTestId}
    >
      <div className={styles.crumbContainer}>
        {LeftIconComponent}
        <span className={styles.crumbText}>{crumbText}</span>
        <ExpandMoreIcon
          className={cx(styles.rightIcon, 'icon-regular', {
            [styles.opened]: opened,
          })}
        />
      </div>
      <ExpandableMenu
        opened={opened}
        close={hideComponent}
        className={styles.content}
      >
        <BottomComponent closeComponent={hideComponent} />
      </ExpandableMenu>
    </div>
  );
}

export default Crumb;
