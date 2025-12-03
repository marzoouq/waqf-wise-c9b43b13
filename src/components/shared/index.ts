// Barrel exports for shared components

// Error Handling
export { GlobalErrorBoundary } from './GlobalErrorBoundary';
export { PageErrorBoundary } from './PageErrorBoundary';
export { LazyErrorBoundary } from './LazyErrorBoundary';
export { ErrorState } from './ErrorState';
export { SelfHealingComponent } from './SelfHealingComponent';

// Loading States
export { LoadingState } from './LoadingState';

// Layout & Display
export { MobileScrollHint } from './MobileScrollHint';
export { ScrollableTableWrapper } from './ScrollableTableWrapper';
export { AnimatedCard } from './AnimatedCard';
export { AnimatedList } from './AnimatedList';
export { ResponsiveDialog } from './ResponsiveDialog';
export { ResponsiveGrid } from './ResponsiveGrid';
export { ResponsiveTable } from './ResponsiveTable';

// Empty States
export { EmptyState, EnhancedEmptyState } from './EmptyState';

// Table Components
export { SortableTableHeader } from './SortableTableHeader';
export { BulkActionsBar } from './BulkActionsBar';

// Dialogs & Filters
export { AdvancedFiltersDialog } from './AdvancedFiltersDialog';
export { DeleteConfirmDialog } from './DeleteConfirmDialog';

// Export & Print
export { ExportButton } from './ExportButton';
export { PrintButton } from './PrintButton';

// Data Display
export { MaskedValue } from './MaskedValue';
export { Pagination } from './Pagination';
export { LazyImage } from './LazyImage';

// Performance - Memoized Components
export {
  MemoizedFinancialStats,
  MemoizedRevenueExpenseChart,
  MemoizedAccountDistributionChart,
  MemoizedBudgetComparisonChart,
  MemoizedAccountingStats,
  MemoizedRecentJournalEntries,
  MemoizedFamiliesStats,
  MemoizedRequestsStats,
  MemoizedTrialBalanceReport,
  MemoizedIncomeStatement,
  MemoizedBalanceSheet,
  MemoizedCashFlowStatement,
  MemoizedTableRow,
  MemoizedCard
} from './MemoizedComponents';

// Performance - Optimization Utilities
export { 
  lazyLoadComponent, 
  OptimizedImage,
  withPerformanceOptimization 
} from './PerformanceOptimizer';

// Optimized Avatar
export { OptimizedAvatar } from './OptimizedAvatar';

// Access Control
export { PermissionGate } from './PermissionGate';

// Search
export { RecentSearches } from './RecentSearches';
export { GlobalSearch } from './GlobalSearch';
