import { SetActiveUserTools, SetActiveUserToolsVariables } from '../mutations/types/SetActiveUserTools';

import { mutationPayloadHelper } from 'Utils/formUtils';
import { useMutation } from '@apollo/client';

import SetActiveProjectToolsMutation from 'Graphql/mutations/setActiveUserTools';

export default function useTool() {
  const [mutationSetActiveProjectTools, { loading }] = useMutation<SetActiveUserTools, SetActiveUserToolsVariables>(
    SetActiveProjectToolsMutation,
    {
      onError: (e) => console.error(`setActiveProjectTools: ${e}`),
    },
  );

  function updateProjectActiveTools(areToolsActive: boolean, runtimeId: string | null) {
    mutationSetActiveProjectTools(mutationPayloadHelper({ active: areToolsActive, runtimeId }));
  }

  return {
    updateProjectActiveTools,
    projectActiveTools: { loading },
  };
}
