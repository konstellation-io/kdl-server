import { selectedRuntime } from '../cache';
import { GetRuntimes_runtimes } from '../../queries/types/GetRuntimes';

function useSelectedRuntime() {
  function updateSelectedRuntime(runtime: GetRuntimes_runtimes) {
    selectedRuntime(runtime);
  }

  return { updateSelectedRuntime };
}

export default useSelectedRuntime;
