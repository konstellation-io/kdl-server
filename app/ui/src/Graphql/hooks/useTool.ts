import { SetActiveUserTools, SetActiveUserToolsVariables } from '../mutations/types/SetActiveUserTools';

import { mutationPayloadHelper } from 'Utils/formUtils';
import { useMutation } from '@apollo/client';

import SetActiveProjectToolsMutation from 'Graphql/mutations/setActiveUserTools';
import useRuntimeLoading from '../client/hooks/useRuntimeLoading';

export default function useTool() {
  const { setRuntimeLoading } = useRuntimeLoading();
  const [mutationSetActiveProjectTools, { loading }] = useMutation<SetActiveUserTools, SetActiveUserToolsVariables>(
    SetActiveProjectToolsMutation,
    {
      onError: (e) => console.error(`setActiveProjectTools: ${e}`),
    },
  );

  async function updateProjectActiveTools(areToolsActive: boolean, runtimeId: string | null) {
    setRuntimeLoading(true);
    await mutationSetActiveProjectTools(mutationPayloadHelper({ active: areToolsActive, runtimeId }));
    setRuntimeLoading(false);
  }

  return {
    updateProjectActiveTools,
    projectActiveTools: { loading },
  };
}
