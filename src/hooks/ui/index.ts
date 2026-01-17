/**
 * UI Hooks - تصدير مركزي
 */
export { usePagination, useServerPagination, type UsePaginationReturn, type PaginationState, type UsePaginationOptions } from "./usePagination";

/**
 * UI Hooks - خطافات واجهة المستخدم
 * @version 2.8.30
 */

export { useIsMobile } from './use-mobile';
export { useMediaQuery } from './use-media-query';
export { useToast, toast } from './use-toast';
export { useLocalStorage } from './useLocalStorage';
export { useBulkSelection } from './useBulkSelection';
export { useCrudDialog } from './useCrudDialog';
export { useTableSort } from './useTableSort';
export { usePrint } from './usePrint';
export { useKeyboardShortcuts, type KeyboardShortcut } from './useKeyboardShortcuts';
export { useImageOptimization } from './useImageOptimization';
export { useExport } from './useExport';
export { useExportToExcel } from './useExportToExcel';
export { useSavedFilters } from './useSavedFilters';
export { useSavedSearches, type SavedSearch } from './useSavedSearches';
export { useAdvancedSearch } from './useAdvancedSearch';
export { useGlobalSearch } from './useGlobalSearch';
export { useTranslation, type Language } from './useTranslation';
export { useDebouncedCallback } from './useDebouncedCallback';
export { useContactForm, type ContactFormData } from './useContactForm';
export { useTasks, type Task } from './useTasks';
export { useActivities, type Activity } from './useActivities';
export { useDialogState, useMultiDialogState, useConfirmDialog } from './useDialogState';
export { 
  useUnifiedExport, 
  formatBeneficiariesForExport,
  formatPaymentsForExport,
  formatInvoicesForExport,
  formatDisclosureForExport,
  formatPropertiesForExport,
  formatContractsForExport,
  type PDFExportConfig,
  type ExcelExportConfig,
  type MultiSheetExcelConfig,
  type FinancialStatementConfig
} from './useUnifiedExport';
export { 
  useFilteredData, 
  useSearchFilter, 
  useRoleFilter,
  type FilterConfig,
  type UseFilteredDataReturn 
} from './useFilteredData';

// Data State & Debounce
export { useDataState, getDataStateStatus, type UseDataStateOptions, type DataStateResult } from './useDataState';
export { useDebouncedSearch } from './useDebouncedSearch';

// Accessibility & UX
export { useAnnounce } from './useAnnounce';
export { useFocusTrap, useRovingTabindex, useFocusVisible, useFocusWithin } from './useFocusManagement';
export { useReducedMotion, useHighContrast, useColorScheme, useSafeAnimation } from './useReducedMotion';
export { useUXIntegration, useNetworkStatus as useNetworkStatusHook, useInteractionTracking, usePagePerformance, useUserPreferences } from './useUXIntegration';
