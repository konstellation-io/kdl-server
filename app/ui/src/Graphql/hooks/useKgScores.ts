import { kgScores } from '../client/cache';

function useKgScores() {
  function updateScores(newScores: [number, number]) {
    kgScores(newScores);
  }

  return {
    updateScores,
  };
}

export default useKgScores;
