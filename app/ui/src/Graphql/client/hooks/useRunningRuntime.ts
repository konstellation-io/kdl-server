import { runningRuntime } from '../cache';
import { GetRuntimes_runtimes } from '../../queries/types/GetRuntimes';

function useRuninngRuntime() {
  function updateRunningRuntime(runtime: GetRuntimes_runtimes | null) {
    runningRuntime(runtime);
  }

  return { updateRunningRuntime };
}

export default useRuninngRuntime;
