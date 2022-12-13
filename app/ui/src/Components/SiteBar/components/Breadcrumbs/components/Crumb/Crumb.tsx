import React from 'react';
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
  title?: string;
  isSelect?: boolean;
  show?: boolean;
};

function Crumb({ crumbText, LeftIconComponent, dataTestId, children, title, isSelect, show = true }: CrumbProps) {
  const { value: opened, toggle: toggleComponent, deactivate: hideComponent } = useBoolState(false);

  return (
    <div
      className={cx(styles.container, { [styles.select]: isSelect, [styles.hidden]: !show })}
      data-testid={dataTestId}
    >
      {title && <span className={styles.crumbTitle}>{title}</span>}
      <div className={cx(styles.crumbContainer, { [styles.select]: isSelect })} onClick={toggleComponent}>
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
