import { loadingRuntime } from '../cache';

function useRuntimeLoading() {
  function setRuntimeLoading(runtimeLoading: string) {
    loadingRuntime(runtimeLoading);
  }

  return { setRuntimeLoading };
}

export default useRuntimeLoading;
