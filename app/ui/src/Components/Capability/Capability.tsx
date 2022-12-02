import React from 'react';
import styles from './Capability.module.scss';
import cx from 'classnames';
import { selectedCapabilities } from 'Graphql/client/cache';
import { useReactiveVar } from '@apollo/client';

type Props = {
  capabilityName: string;
  capabilityId: string;
  isRunning?: boolean;
  disabled?: boolean;
};

function Capability({ capabilityId, capabilityName, isRunning = false, disabled = false }: Props) {
  const selectedCapability = useReactiveVar(selectedCapabilities);

  return (
    <div
      data-testid="capability"
      className={cx(styles.container, {
        [styles.active]: isRunning,
        [styles.disabled]: disabled,
      })}
      onClick={() => {
        if (disabled) return;
        if (selectedCapability?.id === capabilityId) {
          selectedCapabilities(null);
        } else {
          selectedCapabilities({ __typename: 'Capability', id: capabilityId, name: capabilityName, default: false });
        }
      }}
    >
      <div className={styles.content}>
        <p className={styles.name} data-testid="capabilityName">
          {capabilityName}
        </p>
      </div>
    </div>
  );
}

export default Capability;
