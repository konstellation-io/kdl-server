import React, { MouseEvent } from 'react';

import containerStyles from '../../Repository.module.scss';
import cx from 'classnames';
import repositoryStyles from '../RepositoryTypeComponent/Repository.module.scss';
import styles from './RepositoryOption.module.scss';

type Props = {
  title: string;
  subtitle: string;
  actionLabel: string;
  isSelected: boolean;
  onSelect: (e?: MouseEvent<HTMLDivElement> | undefined) => void;
  Repository: JSX.Element;
};

function RepositoryOption({
  title,
  subtitle,
  isSelected,
  onSelect,
  Repository,
}: Props) {
  return (
    <div className={styles.container}>
      <div
        className={cx(
          styles.repoContainer,
          repositoryStyles.hoverContainer,
          containerStyles.server,
          {
            [styles.selected]: isSelected,
          }
        )}
        onClick={onSelect}
      >
        <div>{Repository}</div>
        <p className={styles.title}>{title}</p>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      {isSelected && (
        <p className={styles.selectedLabel}>
          You have selected this type of repository
        </p>
      )}
    </div>
  );
}

export default RepositoryOption;
