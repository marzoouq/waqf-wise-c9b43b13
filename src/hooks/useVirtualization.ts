import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

/**
 * Hook محسّن للجداول الافتراضية (Virtualization)
 * يحسن الأداء عند عرض قوائم كبيرة
 * 
 * @example
 * const { virtualRows, totalSize, scrollRef } = useVirtualization({
 *   count: items.length,
 *   estimateSize: () => 60,
 * });
 */
export function useVirtualization<T extends HTMLElement = HTMLDivElement>({
  count,
  estimateSize = () => 50,
  overscan = 5,
}: {
  count: number;
  estimateSize?: (index: number) => number;
  overscan?: number;
}) {
  const scrollRef = useRef<T>(null);

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize,
    overscan,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return {
    virtualRows,
    totalSize,
    scrollRef,
    scrollToIndex: virtualizer.scrollToIndex,
    scrollToOffset: virtualizer.scrollToOffset,
  };
}
