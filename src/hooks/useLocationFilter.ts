import { useState, useCallback } from 'react';

export function useLocationFilter() {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const selectLocation = useCallback((locationId: string | null) => {
    setSelectedLocationId(locationId);
  }, []);

  return {
    selectedLocationId,
    selectLocation,
  };
}
