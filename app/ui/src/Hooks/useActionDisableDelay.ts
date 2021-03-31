import { useEffect, useState } from 'react';

let disableTimeout: number;

type UseActionDisableDelayOut = [boolean, () => void];

export default function useActionDisableDelay(
  delay: number
): UseActionDisableDelayOut {
  const [disabled, setDisabled] = useState(false);

  useEffect(() => () => clearTimeout(disableTimeout), []);

  useEffect(() => {
    if (disabled) {
      disableTimeout = window.setTimeout(() => setDisabled(false), delay);
    }
  }, [disabled]);

  function disableAction() {
    setDisabled(true);
  }

  return [disabled, disableAction];
}
