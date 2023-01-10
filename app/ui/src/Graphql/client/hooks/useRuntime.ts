import { useMutation, useReactiveVar } from '@apollo/client';
import SetActiveProjectToolsMutation from 'Graphql/mutations/setActiveUserTools';
import { SetActiveUserTools, SetActiveUserToolsVariables } from 'Graphql/mutations/types/SetActiveUserTools';
import { GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';
import { USERTOOLS_PANEL_OPTIONS } from 'Pages/Project/panelSettings';
import { mutationPayloadHelper } from 'Utils/formUtils';
import { lastRanRuntime, runningRuntime } from '../cache';
import useRuntimeLoading from './useRuntimeLoading';
import usePanel, { PanelType } from './usePanel';

function useRuntime(runtime?: GetRuntimes_runtimes) {
  const [mutationSetActiveProjectTools] = useMutation<SetActiveUserTools, SetActiveUserToolsVariables>(
    SetActiveProjectToolsMutation,
    {
      onCompleted: () => {
        updateRunningRuntime(runtime);
        setRuntimeLoading(null);
      },
      onError: (e) => {
        console.error(`setActiveProjectTools: ${e}`);
        setRuntimeLoading(null);
      },
    },
  );

  const { openPanel: openRuntimesList } = usePanel(PanelType.PRIMARY, USERTOOLS_PANEL_OPTIONS);

  const runtimeRunning = useReactiveVar(runningRuntime);

  const { setRuntimeLoading } = useRuntimeLoading();

  function updateRunningRuntime(runtime?: GetRuntimes_runtimes) {
    if (runtime) {
      runningRuntime(runtime);
      lastRanRuntime(runtime);
      return;
    }
    runningRuntime(null);
  }

  async function startRuntime(runtime?: GetRuntimes_runtimes, capabilitiesId?: string | null) {
    if (!runtime) {
      openRuntimesList();
      return;
    }
    const areToolsActive = true;
    setRuntimeLoading(runtime.id ?? '');
    mutationSetActiveProjectTools(
      mutationPayloadHelper({ active: areToolsActive, runtimeId: runtime.id, capabilitiesId: capabilitiesId }),
    );
  }

  function pauseRuntime() {
    const areToolsActive = false;
    const runtimeId = runtimeRunning?.id ?? '';
    setRuntimeLoading(runtimeId);
    mutationSetActiveProjectTools(mutationPayloadHelper({ active: areToolsActive, runtimeId }));
  }

  return {
    updateRunningRuntime,
    startRuntime,
    pauseRuntime,
  };
}

export default useRuntime;
