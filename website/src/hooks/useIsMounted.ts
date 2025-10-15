import { useEffect, useState } from 'react';

// useIsMounted hook to prevent SSR issues
export const useIsMounted = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
};
