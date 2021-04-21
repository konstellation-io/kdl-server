import { kgScore } from '../cache';

export default function useKGFilter() {
  function updateScore(newScore: [number, number]) {
    kgScore(newScore);
  }

  return { updateScore };
}
