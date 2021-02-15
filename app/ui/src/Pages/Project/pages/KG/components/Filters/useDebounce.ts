import { useEffect, useState } from 'react';

function useTopicFilter(values: any, timer: number) {
  const [debouncedValue, setDebouncedValue] = useState(values);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(values), timer);
    return () => clearTimeout(timeoutId);
  }, [values]);

  return debouncedValue;
}

export default useTopicFilter;
