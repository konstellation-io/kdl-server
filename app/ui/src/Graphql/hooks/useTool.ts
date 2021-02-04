import { useMutation } from '@apollo/client';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';
import {
  SetActiveProjectTools,
  SetActiveProjectToolsVariables,
} from '../mutations/types/SetActiveProjectTools';

const SetActiveProjectToolsMutation = loader(
  'Graphql/mutations/setActiveProjectTools.graphql'
);

export default function useTool(projectId: string) {
  const [mutationSetActiveProjectTools, { loading }] = useMutation<
    SetActiveProjectTools,
    SetActiveProjectToolsVariables
  >(SetActiveProjectToolsMutation, {
    onError: (e) => console.error(`setActiveProjectTools: ${e}`),
  });

  function updateProjectActiveTools(areToolsActive: boolean) {
    mutationSetActiveProjectTools(
      mutationPayloadHelper({ id: projectId, value: areToolsActive })
    );
  }

  return {
    updateProjectActiveTools,
    projectActiveTools: { loading },
  };
}
