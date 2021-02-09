import { useState } from 'react';

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
