import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

/**
 * Centralized error handling hook
 * Provides consistent error handling across the application
 * @returns handleError function to process errors
 */
export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback((error: any, context?: string) => {
    // Log error for debugging
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);

    // Extract error message
    const message = error?.message || error?.error?.message || 'حدث خطأ غير متوقع';

    // Show error toast
    toast({
      title: "خطأ",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  return { handleError };
}
