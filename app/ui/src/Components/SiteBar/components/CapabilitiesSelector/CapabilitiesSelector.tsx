import React, { FC } from 'react';
import styles from './CapabilitiesSelector.module.scss';
import { BottomComponentProps } from '../Breadcrumbs/components/Crumb/Crumb';
import { GetCapabilities_capabilities } from 'Graphql/queries/types/GetCapabilities';
import CapabilitiesItem from './CapabilitiesItem/CapabilitiesItem';

type Props = {
  capabilities: GetCapabilities_capabilities[] | undefined;
};

const CapabilitiesSelector: FC<Props & BottomComponentProps> = ({ capabilities, ...props }) => {
  return (
    <div className={styles.container}>
      <ul>
        {capabilities
          ?.slice()
          .sort(
            (a: GetCapabilities_capabilities, b: GetCapabilities_capabilities) =>
              (a.default ? 1 : -1) - (b.default ? 1 : -1),
          )
          .reverse()
          .map((capability: GetCapabilities_capabilities) => (
            <li key={capability.id}>
              <CapabilitiesItem capability={capability} {...props} />
            </li>
          ))}
      </ul>
    </div>
  );
};
export default CapabilitiesSelector;
