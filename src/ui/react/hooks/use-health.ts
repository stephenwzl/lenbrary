import { useEffect, useState } from 'react';
import { getHealth } from '../api';
import type { LibraryHealth } from '../types';

export function useHealth() {
  const [health, setHealth] = useState<LibraryHealth | null>(null);

  async function refreshHealth() {
    try {
      setHealth(await getHealth());
    } catch {
      // Error handled by caller
    }
  }

  useEffect(() => {
    void refreshHealth();
  }, []);

  return { health, refreshHealth };
}
