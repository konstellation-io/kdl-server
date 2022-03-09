import { loadingRuntime } from '../cache';

function useRuntimeLoading() {
  function setRuntimeLoading(runtimeLoading: string | null) {
    loadingRuntime(runtimeLoading);
  }

  return { setRuntimeLoading };
}

export default useRuntimeLoading;
