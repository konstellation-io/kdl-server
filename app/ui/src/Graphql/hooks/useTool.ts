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

  function updateProjectActiveTools(areToolsActive: boolean) {
    mutationSetActiveProjectTools(mutationPayloadHelper({ active: areToolsActive, runtimeId: "61383716a8c1d7ce4764f411" }));
  }

  return {
    updateProjectActiveTools,
    projectActiveTools: { loading },
  };
}
