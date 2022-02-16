import { isRuntimeLoading } from '../cache';

function useRuntimeLoading() {
  function setRuntimeLoading(isLoading?: boolean) {
    isRuntimeLoading(isLoading);
  }

  return { setRuntimeLoading };
}

export default useRuntimeLoading;
