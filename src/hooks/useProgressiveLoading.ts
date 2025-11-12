import { useState, useEffect } from "react";

/**
 * Progressive Loading Hook
 * Loads large datasets incrementally to improve perceived performance
 * @param data - Array of data to load progressively
 * @param batchSize - Number of items to load per batch (default: 20)
 * @returns Object with displayedData and isLoading state
 */
export function useProgressiveLoading<T>(
  data: T[] | undefined,
  batchSize: number = 20
) {
  const [displayedData, setDisplayedData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!data) return;

    let currentIndex = 0;
    setDisplayedData([]);
    setIsLoading(true);

    const loadBatch = () => {
      const nextBatch = data.slice(currentIndex, currentIndex + batchSize);
      setDisplayedData(prev => [...prev, ...nextBatch]);
      currentIndex += batchSize;

      if (currentIndex < data.length) {
        // Load next batch after a short delay
        setTimeout(loadBatch, 50);
      } else {
        setIsLoading(false);
      }
    };

    loadBatch();
  }, [data, batchSize]);

  return { displayedData, isLoading };
}
