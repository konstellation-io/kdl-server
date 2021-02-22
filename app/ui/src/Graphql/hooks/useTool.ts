import {
  SetActiveUserTools,
  SetActiveUserToolsVariables,
} from '../mutations/types/SetActiveUserTools';

import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';
import { useMutation } from '@apollo/client';

const SetActiveProjectToolsMutation = loader(
  'Graphql/mutations/setActiveUserTools.graphql'
);

export default function useTool(projectId: string) {
  const [mutationSetActiveProjectTools, { loading }] = useMutation<
    SetActiveUserTools,
    SetActiveUserToolsVariables
  >(SetActiveProjectToolsMutation, {
    onError: (e) => console.error(`setActiveProjectTools: ${e}`),
  });

  function updateProjectActiveTools(areToolsActive: boolean) {
    mutationSetActiveProjectTools(
      mutationPayloadHelper({ active: areToolsActive })
    );
  }

  return {
    updateProjectActiveTools,
    projectActiveTools: { loading },
  };
}
