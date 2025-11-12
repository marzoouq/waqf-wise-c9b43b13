import { useEffect } from "react";

/**
 * Focus Trap Hook - Traps focus within a dialog/modal when open
 * Ensures keyboard navigation stays within the modal for accessibility
 * @param isOpen - Whether the trap should be active
 */
export function useFocusTrap(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = document.querySelectorAll(
      'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element when trap activates
    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      // If shift+tab on first element, go to last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
      // If tab on last element, go to first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);
}
