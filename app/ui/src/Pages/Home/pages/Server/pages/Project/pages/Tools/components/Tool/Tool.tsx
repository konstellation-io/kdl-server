import React, { FC } from 'react';
import cx from 'classnames';
import styles from '../../Tools.module.scss';

export interface ToolProps {
  img: string;
  title: string;
  description: string;
  disabled?: boolean;
  onClick?: () => void;
}

const Tool: FC<ToolProps> = ({
  img,
  title,
  description,
  disabled = false,
  onClick = () => {},
}) => (
  <div
    className={cx(styles.cardContent, { [styles.disabled]: disabled })}
    onClick={() => !disabled && onClick()}
  >
    <div className={styles.imgContainer}>
      <img className={styles.toolImg} src={img} alt={`${title}_img`} />
    </div>
    <p className={styles.toolTitle}>{title}</p>
    <p className={styles.toolDescription}>{description}</p>
  </div>
);

export default Tool;
