import { GetCapabilities_capabilities } from 'Graphql/queries/types/GetCapabilities';
import { selectedCapabilities } from '../cache';

function useCapabilities() {
  function setRunningCapabilities(selectedCapability: GetCapabilities_capabilities | null) {
    selectedCapabilities(selectedCapability);
  }

  return { setRunningCapabilities };
}

export default useCapabilities;
