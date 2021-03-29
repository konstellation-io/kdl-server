import { useCallback } from 'react';

function useUnloadPrompt() {
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
  }, []);

  function enableUnloadPrompt() {
    window.addEventListener('beforeunload', handleBeforeUnload);
  }

  function disableUnloadPrompt() {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  }

  return {
    enableUnloadPrompt,
    disableUnloadPrompt,
  };
}

export default useUnloadPrompt;
