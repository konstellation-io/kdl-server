const actualRuntimeInfo = {
  runtime: '',
};

const useRuntimeInfo = (): [string, (runtime: string) => void] => {
  const updateOpenedInfo = (runtimeId: string) => {
    actualRuntimeInfo.runtime = runtimeId;
  };

  return [actualRuntimeInfo.runtime, updateOpenedInfo];
};

export default useRuntimeInfo;
