import { lastRanRuntime, runningRuntime, actionRuntime, selectedRuntime } from '../cache';
import { GetRuntimes_runtimes } from '../../queries/types/GetRuntimes';
import { RuntimeActions } from '../models/RuntimeAction';

function useRuntime() {
  function updateRunningRuntime(runtime: GetRuntimes_runtimes | null) {
    runningRuntime(runtime);
  }

  function updateSelectedRuntime(runtime: GetRuntimes_runtimes) {
    selectedRuntime(runtime);
  }

  function updateLastRanRuntime(runtime: GetRuntimes_runtimes | null) {
    lastRanRuntime(runtime);
  }

  function startRuntime(runtime: GetRuntimes_runtimes | null) {
    actionRuntime({
      action: RuntimeActions.START,
      runtime: runtime,
    });
  }

  function pauseRuntime() {
    actionRuntime({
      action: RuntimeActions.STOP,
      runtime: null,
    });
  }

  return {
    updateRunningRuntime,
    updateSelectedRuntime,
    updateLastRanRuntime,
    startRuntime,
    pauseRuntime,
  };
}

export default useRuntime;
