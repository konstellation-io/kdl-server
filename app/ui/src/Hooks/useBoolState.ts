import { useState } from 'react';

// TODO: use this hook in more places
function useBoolState(defaultValue = false) {
  const [value, setValue] = useState(defaultValue);

  function toggle() {
    setValue(!value);
  }

  function activate() {
    setValue(true);
  }

  function deactivate() {
    setValue(false);
  }

  return {
    value,
    setValue,
    toggle,
    activate,
    deactivate,
  };
}

export default useBoolState;
