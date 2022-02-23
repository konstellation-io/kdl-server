import { lastRanRuntime } from '../cache';
import { GetRuntimes_runtimes } from '../../queries/types/GetRuntimes';

function useLastRanRuntime() {
  function updateLastRanRuntime(runtime: GetRuntimes_runtimes | null) {
    lastRanRuntime(runtime);
  }

  return { updateLastRanRuntime };
}

export default useLastRanRuntime;
