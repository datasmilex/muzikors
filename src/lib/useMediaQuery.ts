'use client';

import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverFallback
  );
}

/** Yatay ekranda pencereler ortada açılır, dikeyde alttan kayar */
export const useIsLandscape = () => useMediaQuery('(orientation: landscape)');
