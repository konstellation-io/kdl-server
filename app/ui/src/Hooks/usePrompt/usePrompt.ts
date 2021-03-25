import { promptEnabled } from 'Graphql/client/cache';

function usePrompt(message: string) {
  function enablePrompt() {
    promptEnabled({
      isEnabled: true,
      message,
    });
    window.addEventListener('beforeunload', handleBeforeUnload);
  }

  function disablePrompt() {
    promptEnabled({
      isEnabled: false,
      message,
    });
    window.removeEventListener('beforeunload', handleBeforeUnload);
    console.log('in the hook');
  }

  function handleBeforeUnload(e: BeforeUnloadEvent) {
    e.preventDefault();
    e.returnValue = '';
  }

  return { enablePrompt, disablePrompt };
}

export default usePrompt;
