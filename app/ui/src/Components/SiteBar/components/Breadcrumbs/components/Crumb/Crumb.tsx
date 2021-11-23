import * as React from 'react';
import styles from './Crumb.module.scss';
import cx from 'classnames';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import useBoolState from 'Hooks/useBoolState';
import { ExpandableMenu } from 'kwc';

export interface BottomComponentProps {
  closeComponent: () => void;
}
export type CrumbProps = {
  dataTestId?: string;
  crumbText: string;
  LeftIconComponent: React.ReactElement;
  children: (props: BottomComponentProps) => JSX.Element;
};

function Crumb({ crumbText, LeftIconComponent, dataTestId, children }: CrumbProps) {
  const { value: opened, toggle: toggleComponent, deactivate: hideComponent } = useBoolState(false);

  return (
    <div className={styles.container} onClick={toggleComponent} data-testid={dataTestId}>
      <div className={styles.crumbContainer}>
        {LeftIconComponent}
        <span className={styles.crumbText}>{crumbText}</span>
        <ExpandMoreIcon
          className={cx(styles.rightIcon, 'icon-regular', {
            [styles.opened]: opened,
          })}
        />
      </div>
      <ExpandableMenu opened={opened} close={hideComponent} className={styles.content}>
        {children({
          closeComponent: hideComponent,
        })}
      </ExpandableMenu>
    </div>
  );
}

export default Crumb;
