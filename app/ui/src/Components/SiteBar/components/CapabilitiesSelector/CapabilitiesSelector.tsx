import React, { FC } from 'react';
import styles from './CapabilitiesSelector.module.scss';
import { useReactiveVar } from '@apollo/client';
import { selectedCapabilities } from 'Graphql/client/cache';
import { BottomComponentProps } from '../Breadcrumbs/components/Crumb/Crumb';
import { GetCapabilities_capabilities } from 'Graphql/queries/types/GetCapabilities';
import CapabilitiesItem from './CapabilitiesItem/CapabilitiesItem';

type Props = {
  capabilities: GetCapabilities_capabilities[] | undefined;
};

function sortCapability(
  capability1: GetCapabilities_capabilities,
  capability2: GetCapabilities_capabilities,
  selectedCapabilityId: string | null,
) {
  return capability1.default ? 1 : -1;
}

const CapabilitiesSelector: FC<Props & BottomComponentProps> = ({ capabilities, ...props }) => {
  const selectedCapability = useReactiveVar(selectedCapabilities);

  return (
    <div className={styles.container}>
      <ul>
        {capabilities
          ?.slice()
          .sort((a: GetCapabilities_capabilities, b: GetCapabilities_capabilities) =>
            sortCapability(a, b, selectedCapability ? selectedCapability.id : null),
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
